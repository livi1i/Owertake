"""Exercise the packaged Timeweb CRM against an isolated SQLite database."""
from argparse import ArgumentParser
from base64 import b64decode, b64encode
from contextlib import ExitStack
from pathlib import Path
import hashlib
import json
import os
import socket
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

parser = ArgumentParser()
parser.add_argument("manifest", type=Path)
parser.add_argument("--root", type=Path, default=Path.cwd())
parser.add_argument("--php", default="php")
args = parser.parse_args()
files = json.loads(args.manifest.read_text(encoding="utf-8"))
assert "api.php" in files
assert "client/index.html" in files
schema = (args.root / "drizzle/0000_initial.sql").read_text(encoding="utf-8-sig")
migration = (args.root / "drizzle/0001_os5.sql").read_text(encoding="utf-8-sig")
router = (args.root / "server/timeweb-index.php").read_bytes()
role_email = {"admin": "owner@example.test", "client": "client@example.test", "unrelated": "other@example.test", "manager":"manager@example.test"}
password = "OS5-test-account-only-2026"

def fixture_pdf(marker):
    text = "%PDF-1.4\n% isolated fixture " + marker + "\n%%EOF\n"
    return b64encode(text.encode()).decode()

with tempfile.TemporaryDirectory(prefix="overtake-os5-qa-") as temporary, ExitStack() as cleanup:
    root = Path(temporary)
    public = root / "public_html"
    private = root / "overtake-private"
    public.mkdir()
    release = private / "releases/0123456789abcdef"
    release.mkdir(parents=True)
    (private / "current").write_text(release.name, encoding="utf-8")
    for name, encoded in files.items():
        if name != "api.php" and name != "client/index.html" and not name.startswith("client/assets/"):
            raise ValueError("Unexpected manifest path")
        target = (release / name).resolve()
        assert target.is_relative_to(release.resolve())
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(b64decode(encoded, validate=True))
    (public / "index.php").write_bytes(router)
    subprocess.run([args.php, "-l", str(release / "api.php")], check=True)
    database = private / "data.sqlite"
    with sqlite3.connect(database) as db:
        db.execute("PRAGMA foreign_keys=ON")
        db.executescript(schema)
        db.execute("INSERT INTO content VALUES('public', ?)", (json.dumps({"projects":[],"contacts":{},"prices":{"P26-7":"7000"}}),))
        salt = "synthetic-isolated-qa"
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
        for key, email in role_email.items():
            db.execute("INSERT INTO users VALUES(?,?,?,?,?,?,?)",(key, key, email, digest, salt, "admin" if key=="admin" else "client", "2026-11-25"))
        db.executescript("BEGIN IMMEDIATE;\n" + migration + "\nCOMMIT;")
        db.executescript("BEGIN IMMEDIATE;\n" + migration + "\nCOMMIT;")
        assert db.execute("PRAGMA quick_check").fetchone() == ("ok",)
        assert not db.execute("PRAGMA foreign_key_check").fetchall()
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port=sock.getsockname()[1]
    origin = f"http://127.0.0.1:{port}"
    (private / "config.json").write_text(json.dumps({"origin":origin,"os5_enabled":True}),encoding="utf-8")
    with (root/"server.log").open("w") as log:
        process = subprocess.Popen([args.php,"-S",f"127.0.0.1:{port}","-t",str(public),str(public/"index.php")],stdout=log,stderr=log)
        def stop():
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=6)
        cleanup.callback(stop)
        def call(path, method="GET", body=None, cookie="", status=200):
            request=urllib.request.Request(origin+path,method=method,
                data=None if body is None else json.dumps(body).encode(),
                headers={"Content-Type":"application/json","Origin":origin,"Cookie":cookie})
            try:
                response=urllib.request.urlopen(request,timeout=4)
            except urllib.error.HTTPError as error:
                response=error
            with response:
                payload=response.read()
                if "json" in response.headers.get("Content-Type",""):
                    payload=json.loads(payload)
                if response.code!=status:
                    raise AssertionError(f"{method} {path}: expected {status}, received {response.code}: {payload}")
                return payload,response.headers
        for retry in range(30):
            try:
                assert call("/api/os5/status")[0] == {"enabled":True}
                break
            except urllib.error.URLError:
                if retry==29: raise
                time.sleep(.1)
        call("/cabinet",status=200)
        call("/api/os5/projects",status=401)
        def login(role):
            _,headers=call("/api/login","POST",{"email":role_email[role],"password":password})
            return headers["Set-Cookie"].split(";")[0]
        owner,client,unrelated,_=map(login,role_email)
        def os5(path,method="GET",body=None,cookie=owner,status=200):
            return call("/api/os5/"+path,method,body,cookie,status)[0]
        partner=os5("partners","POST",{"name":"Test partner","code":"partner-test"},status=201)
        value,_=call("/api/leads","POST",{"name":"Test client","contact":role_email["client"],"service":"Landing",
            "description":"Production flow in an isolated SQLite test","consent":True,"referral":"partner-test"},client)
        source=value["id"]
        req=os5("requests")["items"][0]
        assert req["user_id"]=="client" and req["partner_name"]=="Test partner" and req["consent_recorded"]==1
        customer={"name":"Test client","kind":"person","email":role_email["client"],"address":"Test address"}
        customer_id=os5("clients","POST",customer,status=201)["id"]
        assert os5("clients","POST",customer,status=409)["id"]==customer_id
        deal=os5("requests/"+source+"/convert","POST",{"clientId":customer_id},status=201)["id"]
        assert os5("requests/"+source+"/convert","POST",{"clientId":customer_id})["id"]==deal
        os5("deals/"+deal+"/stage","POST",{"stageId":"won","version":1},status=409)
        os5("deals/"+deal+"/project","POST",{},status=409)
        os5("users/manager/role","POST",{"role":"manager","basis":"Approved test employee"})
        manager=login("manager")
        os5("org",cookie=manager,status=403)
        assert not os5("deals",cookie=manager)["items"]
        os5("deals/"+deal+"/assign","POST",{"userId":"manager"})
        assigned=os5("deals",cookie=manager)["items"][0]
        os5("deals/"+deal+"/stage","POST",{"stageId":"contact","version":assigned["version"]},cookie=manager)
        assert os5("overview")["counts"]["received"]==0
        brief=os5("briefs","POST",{"dealId":deal,"scope":"Precisely scoped delivery"},status=201)["id"]
        os5("briefs/"+brief+"/approve","POST",{"basis":"Documented synthetic client approval"})
        quote=os5("quotes","POST",{"briefId":brief,"lines":[{"code":"P26-7","quantity":1,"unitAmount":1}]},status=201)
        assert quote["total"]==700000
        invoice=os5("invoices","POST",{"quoteId":quote["id"]},status=201)["id"]
        path="invoices/"+invoice
        body={"pdf":fixture_pdf("original"),"reviewed":True}
        os5(path+"/issue","POST",body,status=409)
        org={"name":"Test seller","address":"Test address","signatory":"Test signer","bank":"Test bank","tax":"Test-only status",
             "templateApproval":"Synthetic review","bik":"123456789","taxId":"123456789012","account":"12345678901234567890",
             "correspondent":"12345678901234567890","registration":"123456789012345"}
        os5("org","PUT",org,cookie=unrelated,status=403)
        os5("org","PUT",org)
        os5(path+"/issue","POST",body)
        os5(path+"/issue","POST",body,status=409)
        signature=os5(path+"/signed","POST",{"pdf":fixture_pdf("review copy")},status=201)["id"]
        os5("deals/"+deal+"/project","POST",{},status=409)
        os5("signatures/"+signature+"/review","POST",{"bothParties":True,"basis":"Both synthetic signatures reviewed"})
        payment=os5("payments","POST",{"invoiceId":invoice,"reference":"bank-test-1","proof":"Synthetic statement row",
            "amount":700000,"occurredOn":"2026-11-25"},status=201)["id"]
        assert os5("overview")["counts"]["received"]==0
        os5("deals/"+deal+"/project","POST",{},status=409)
        os5("payments/"+payment+"/verify","POST",{"basis":"Statement row checked"})
        project=os5("deals/"+deal+"/project","POST",{},status=201)["id"]
        assert os5("deals/"+deal+"/project","POST",{})["id"]==project
        assert os5("overview")["counts"]["received"]==700000
        os5("projects/"+project,cookie=client,status=404)
        os5("projects/"+project+"/memberships","POST",{"userId":"client","basis":"Representative verified in fixture"})
        view=os5("projects/"+project,cookie=client)
        assert len(view["milestones"])==6 and len(view["documents"])==1
        assert not os5("projects/"+project,cookie=manager)["documents"]
        os5("projects/"+project+"/milestones/1","POST",{},cookie=client,status=409)
        os5("projects/"+project+"/milestones/1","PUT",{})
        os5("projects/"+project+"/milestones/1","POST",{},cookie=client)
        os5("projects/"+project+"/support","POST",{"kind":"defect","subject":"Defect","body":"Synthetic defect detail"},cookie=client,status=201)
        os5("projects/"+project,cookie=unrelated,status=404)
        call("/api/os5/"+path+"/pdf",cookie=unrelated,status=404)
        pdf,_=call("/api/os5/"+path+"/pdf",cookie=client)
        assert pdf.startswith(b"%PDF-")
        assert len(os5("partners")["items"])==1
        with sqlite3.connect(database) as db:
            assert not db.execute("PRAGMA foreign_key_check").fetchall()
            assert db.execute("SELECT count(*) FROM os5_projects").fetchone()==(1,)
            assert db.execute("SELECT count(*) FROM os5_tasks").fetchone()==(1,)
        stop()
        print("PASS: isolated PHP blank migration twice, lead/referral, deduplication, role checks, immutable PDF gates, full payment, idempotent project, milestone, defect, PDF isolation")
