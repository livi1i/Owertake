CREATE TABLE IF NOT EXISTS os5_schema_meta (version TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS os5_clients (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('person','entrepreneur','company')),
  name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT UNIQUE, tax_id TEXT UNIQUE,
  details TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(details)),
  created TEXT NOT NULL, archived_at TEXT
);
CREATE TABLE IF NOT EXISTS os5_stages (
  id TEXT PRIMARY KEY, title TEXT NOT NULL UNIQUE, position INTEGER NOT NULL,
  terminal INTEGER NOT NULL DEFAULT 0 CHECK(terminal IN (0,1))
);
WITH default_stages(id,title,position,terminal) AS (VALUES
 ('new','Новая',10,0),('contact','На связи',20,0),('discovery','Уточнение',30,0),
 ('brief','Бриф',40,0),('offer','Предложение',50,0),('contract','Договор и оплата',60,0),
 ('won','Успешно',70,1),('lost','Не состоялась',80,1))
INSERT OR IGNORE INTO os5_stages SELECT * FROM default_stages WHERE NOT EXISTS (SELECT 1 FROM os5_schema_meta WHERE version='core-1');

CREATE TABLE IF NOT EXISTS os5_deals (
  id TEXT PRIMARY KEY, request_id TEXT UNIQUE REFERENCES leads(id), client_id TEXT NOT NULL REFERENCES os5_clients(id),
  owner_id TEXT NOT NULL REFERENCES users(id), stage_id TEXT NOT NULL REFERENCES os5_stages(id),
  title TEXT NOT NULL, created TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, archived_at TEXT
);
CREATE TABLE IF NOT EXISTS os5_briefs (
  id TEXT PRIMARY KEY, deal_id TEXT NOT NULL REFERENCES os5_deals(id), revision INTEGER NOT NULL,
  scope TEXT NOT NULL, author_id TEXT NOT NULL REFERENCES users(id), created TEXT NOT NULL,
  approved_at TEXT, approved_by TEXT REFERENCES users(id), UNIQUE(deal_id,revision)
);
CREATE TABLE IF NOT EXISTS os5_quotes (
  id TEXT PRIMARY KEY, deal_id TEXT NOT NULL REFERENCES os5_deals(id), brief_id TEXT NOT NULL REFERENCES os5_briefs(id),
  revision INTEGER NOT NULL, lines TEXT NOT NULL CHECK(json_valid(lines)), total INTEGER NOT NULL CHECK(total>0),
  created TEXT NOT NULL, UNIQUE(deal_id,revision)
);
CREATE TABLE IF NOT EXISTS os5_org (
  id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL CHECK(json_valid(data)), updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_invoices (
  id TEXT PRIMARY KEY, deal_id TEXT NOT NULL REFERENCES os5_deals(id), quote_id TEXT NOT NULL UNIQUE REFERENCES os5_quotes(id),
  number TEXT NOT NULL UNIQUE, total INTEGER NOT NULL CHECK(total>0), start_min INTEGER NOT NULL CHECK(start_min>0 AND start_min<=total),
  terms TEXT NOT NULL DEFAULT '', created TEXT NOT NULL, issued_at TEXT, snapshot TEXT CHECK(snapshot IS NULL OR json_valid(snapshot)),
  pdf TEXT, pdf_hash TEXT, revoked_at TEXT,
  CHECK(start_min=total OR length(trim(terms))>=12),
  CHECK((issued_at IS NULL AND snapshot IS NULL AND pdf IS NULL AND pdf_hash IS NULL) OR
        (issued_at IS NOT NULL AND snapshot IS NOT NULL AND pdf IS NOT NULL AND pdf_hash IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS os5_live_invoice_per_deal ON os5_invoices(deal_id) WHERE revoked_at IS NULL;
CREATE TRIGGER IF NOT EXISTS os5_issued_invoice_immutable BEFORE UPDATE OF deal_id,quote_id,number,total,start_min,terms,issued_at,snapshot,pdf,pdf_hash ON os5_invoices
WHEN OLD.issued_at IS NOT NULL BEGIN SELECT RAISE(ABORT,'os5_invoice_immutable'); END;

CREATE TABLE IF NOT EXISTS os5_signatures (
  id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES os5_invoices(id), source_hash TEXT NOT NULL,
  pdf TEXT NOT NULL, pdf_hash TEXT NOT NULL, created TEXT NOT NULL, reviewed_at TEXT,
  reviewed_by TEXT REFERENCES users(id), review_basis TEXT, UNIQUE(invoice_id,pdf_hash)
);
CREATE TABLE IF NOT EXISTS os5_payments (
  id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL REFERENCES os5_invoices(id), bank_ref TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL CHECK(amount<>0), refund_of TEXT REFERENCES os5_payments(id), proof TEXT NOT NULL,
  occurred_on TEXT NOT NULL, created TEXT NOT NULL, verified_at TEXT, verified_by TEXT REFERENCES users(id),
  CHECK((amount>0 AND refund_of IS NULL) OR (amount<0 AND refund_of IS NOT NULL))
);
CREATE TRIGGER IF NOT EXISTS os5_payment_immutable BEFORE UPDATE ON os5_payments
WHEN OLD.verified_at IS NOT NULL BEGIN SELECT RAISE(ABORT,'os5_payment_immutable'); END;
CREATE TRIGGER IF NOT EXISTS os5_refund_limit BEFORE UPDATE OF verified_at ON os5_payments
WHEN NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL AND NEW.amount<0 AND NOT EXISTS (
  SELECT 1 FROM os5_payments source WHERE source.id=NEW.refund_of AND source.invoice_id=NEW.invoice_id
    AND source.verified_at IS NOT NULL AND source.amount>0 AND
      source.amount + NEW.amount + COALESCE((SELECT SUM(amount) FROM os5_payments WHERE refund_of=source.id AND verified_at IS NOT NULL),0)>=0
) BEGIN SELECT RAISE(ABORT,'os5_refund_limit'); END;

CREATE TABLE IF NOT EXISTS os5_projects (
  id TEXT PRIMARY KEY, deal_id TEXT NOT NULL UNIQUE REFERENCES os5_deals(id), client_id TEXT NOT NULL REFERENCES os5_clients(id),
  invoice_id TEXT NOT NULL UNIQUE REFERENCES os5_invoices(id), owner_id TEXT NOT NULL REFERENCES users(id),
  created_by TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL, created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_milestones (
  project_id TEXT NOT NULL REFERENCES os5_projects(id), position INTEGER NOT NULL, title TEXT NOT NULL,
  ready_at TEXT, approved_at TEXT, PRIMARY KEY(project_id,position)
);
CREATE TABLE IF NOT EXISTS os5_memberships (
  project_id TEXT NOT NULL REFERENCES os5_projects(id), user_id TEXT NOT NULL REFERENCES users(id),
  granted_by TEXT NOT NULL REFERENCES users(id), basis TEXT NOT NULL, created TEXT NOT NULL,
  PRIMARY KEY(project_id,user_id)
);
CREATE TABLE IF NOT EXISTS os5_tasks (
  id TEXT PRIMARY KEY, project_id TEXT REFERENCES os5_projects(id), deal_id TEXT REFERENCES os5_deals(id),
  title TEXT NOT NULL, due_on TEXT, done_at TEXT, created TEXT NOT NULL,
  CHECK(project_id IS NOT NULL OR deal_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS os5_support (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES os5_projects(id), author_id TEXT NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL CHECK(kind IN ('question','defect','change')), subject TEXT NOT NULL, body TEXT NOT NULL,
  created TEXT NOT NULL, resolved_at TEXT
);
CREATE TABLE IF NOT EXISTS os5_infrastructure (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES os5_projects(id),
  kind TEXT NOT NULL CHECK(kind IN ('domain','hosting')), title TEXT NOT NULL, provider TEXT NOT NULL,
  renewed_until TEXT NOT NULL, payer TEXT NOT NULL CHECK(payer IN ('client','agency')), created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id), theme TEXT NOT NULL CHECK(theme IN ('light','dark')),
  accent TEXT NOT NULL CHECK(accent IN ('blue','mint','violet','graphite')),
  layout TEXT NOT NULL CHECK(layout IN ('left','top','right','bottom')),
  density TEXT NOT NULL CHECK(density IN ('comfortable','compact'))
);
CREATE TABLE IF NOT EXISTS os5_audit (
  seq INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL REFERENCES users(id),
  entity TEXT NOT NULL, entity_id TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '{}', created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS os5_audit_entity ON os5_audit(entity,entity_id,seq);
CREATE INDEX IF NOT EXISTS os5_projects_membership ON os5_memberships(user_id,project_id);
CREATE INDEX IF NOT EXISTS os5_payments_invoice ON os5_payments(invoice_id,verified_at);
CREATE INDEX IF NOT EXISTS os5_renewals ON os5_infrastructure(renewed_until);

CREATE TRIGGER IF NOT EXISTS os5_project_gate BEFORE INSERT ON os5_projects
WHEN NOT EXISTS (
  SELECT 1 FROM os5_deals d JOIN os5_invoices i ON i.deal_id=d.id JOIN os5_quotes q ON q.id=i.quote_id
  JOIN os5_briefs b ON b.id=q.brief_id
  WHERE EXISTS (SELECT 1 FROM users WHERE id=NEW.created_by AND role='admin') AND d.id=NEW.deal_id AND d.client_id=NEW.client_id AND d.owner_id=NEW.owner_id AND d.archived_at IS NULL AND d.stage_id<>'lost'
    AND i.id=NEW.invoice_id AND i.issued_at IS NOT NULL AND i.revoked_at IS NULL
    AND b.deal_id=d.id AND q.deal_id=d.id AND b.approved_at IS NOT NULL
    AND EXISTS(SELECT 1 FROM os5_signatures s WHERE s.invoice_id=i.id AND s.source_hash=i.pdf_hash AND s.reviewed_at IS NOT NULL)
    AND COALESCE((SELECT SUM(p.amount) FROM os5_payments p WHERE p.invoice_id=i.id AND p.verified_at IS NOT NULL),0)>=i.start_min
) BEGIN SELECT RAISE(ABORT,'os5_project_gate'); END;
CREATE TRIGGER IF NOT EXISTS os5_deal_win_gate BEFORE UPDATE OF stage_id ON os5_deals
WHEN NEW.stage_id='won' AND NOT EXISTS (SELECT 1 FROM os5_projects WHERE deal_id=NEW.id)
BEGIN SELECT RAISE(ABORT,'os5_deal_win_gate'); END;
CREATE TRIGGER IF NOT EXISTS os5_create_project_plan AFTER INSERT ON os5_projects
BEGIN
  INSERT INTO os5_milestones VALUES(NEW.id,1,'Старт',NULL,NULL),(NEW.id,2,'ТЗ и структура',NULL,NULL),(NEW.id,3,'Дизайн',NULL,NULL),
    (NEW.id,4,'Разработка',NULL,NULL),(NEW.id,5,'Тестирование',NULL,NULL),(NEW.id,6,'Сдача',NULL,NULL);
  INSERT INTO os5_tasks(id,project_id,deal_id,title,created)
    VALUES(NEW.id||'-kickoff',NEW.id,NEW.deal_id,'Согласовать план запуска',NEW.created);
  UPDATE os5_deals SET stage_id='won',version=version+1 WHERE id=NEW.deal_id;
  INSERT INTO os5_audit(actor_id,entity,entity_id,action,created)
    VALUES(NEW.created_by,'project',NEW.id,'converted',NEW.created);
END;

CREATE TABLE IF NOT EXISTS os5_org_versions (
  revision INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL CHECK(json_valid(data)), created TEXT NOT NULL
);
CREATE TRIGGER IF NOT EXISTS os5_org_version_insert AFTER INSERT ON os5_org
BEGIN INSERT INTO os5_org_versions(data,created) VALUES(NEW.data,NEW.updated_at); END;
CREATE TRIGGER IF NOT EXISTS os5_org_version_update AFTER UPDATE ON os5_org
BEGIN INSERT INTO os5_org_versions(data,created) VALUES(NEW.data,NEW.updated_at); END;

CREATE TABLE IF NOT EXISTS os5_support_messages (
  id TEXT PRIMARY KEY, ticket_id TEXT NOT NULL REFERENCES os5_support(id),
  sender_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL, created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_partners (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_referrals (
  request_id TEXT PRIMARY KEY REFERENCES leads(id), partner_id TEXT NOT NULL REFERENCES os5_partners(id),
  created TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_mail_drafts (
  id TEXT PRIMARY KEY, author_id TEXT NOT NULL REFERENCES users(id), client_id TEXT REFERENCES os5_clients(id),
  recipient TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS os5_request_reads (
  user_id TEXT NOT NULL REFERENCES users(id), request_id TEXT NOT NULL REFERENCES leads(id),
  created TEXT NOT NULL, PRIMARY KEY(user_id,request_id)
);
CREATE TRIGGER IF NOT EXISTS os5_client_has_deals BEFORE UPDATE OF archived_at ON os5_clients
WHEN NEW.archived_at IS NOT NULL AND EXISTS (SELECT 1 FROM os5_deals WHERE client_id=NEW.id AND archived_at IS NULL)
BEGIN SELECT RAISE(ABORT,'os5_client_has_deals'); END;
CREATE TRIGGER IF NOT EXISTS os5_deal_has_agreement BEFORE UPDATE OF archived_at ON os5_deals
WHEN NEW.archived_at IS NOT NULL AND EXISTS (SELECT 1 FROM os5_invoices WHERE deal_id=NEW.id AND revoked_at IS NULL)
BEGIN SELECT RAISE(ABORT,'os5_deal_has_agreement'); END;
CREATE TRIGGER IF NOT EXISTS os5_deal_active_client BEFORE INSERT ON os5_deals
WHEN EXISTS(SELECT 1 FROM os5_clients WHERE id=NEW.client_id AND archived_at IS NOT NULL)
BEGIN SELECT RAISE(ABORT,'os5_deal_active_client'); END;
CREATE TRIGGER IF NOT EXISTS os5_invoice_active_deal BEFORE INSERT ON os5_invoices
WHEN EXISTS(SELECT 1 FROM os5_deals WHERE id=NEW.deal_id AND (archived_at IS NOT NULL OR stage_id IN ('lost','won')))
BEGIN SELECT RAISE(ABORT,'os5_invoice_active_deal'); END;
CREATE TRIGGER IF NOT EXISTS os5_invoice_revoke_guard BEFORE UPDATE OF revoked_at ON os5_invoices
WHEN NEW.revoked_at IS NOT NULL AND (
 EXISTS(SELECT 1 FROM os5_projects WHERE invoice_id=NEW.id) OR
 EXISTS(SELECT 1 FROM os5_payments WHERE invoice_id=NEW.id) OR
 EXISTS(SELECT 1 FROM os5_signatures WHERE invoice_id=NEW.id AND reviewed_at IS NOT NULL)
)
BEGIN SELECT RAISE(ABORT,'os5_invoice_revoke_guard'); END;

INSERT OR IGNORE INTO os5_schema_meta VALUES('core-1');

CREATE TRIGGER IF NOT EXISTS os5_membership_client_only BEFORE INSERT ON os5_memberships
WHEN NOT EXISTS(SELECT 1 FROM users WHERE id=NEW.user_id AND role='client')
BEGIN SELECT RAISE(ABORT,'os5_member_not_client'); END;
CREATE TRIGGER IF NOT EXISTS os5_role_guard BEFORE UPDATE OF role ON users
WHEN (NEW.role<>'client' AND EXISTS(SELECT 1 FROM os5_memberships WHERE user_id=NEW.id))
  OR (NEW.role='client' AND OLD.role='manager' AND (
    EXISTS(SELECT 1 FROM os5_deals WHERE owner_id=NEW.id AND archived_at IS NULL)
    OR EXISTS(SELECT 1 FROM os5_projects WHERE owner_id=NEW.id)))
BEGIN SELECT RAISE(ABORT,'os5_active_role_links'); END;
