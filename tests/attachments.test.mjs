import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';
import {database} from '../scripts/local-db.mjs';
test('attachments validate data, enforce quotas, isolate access and preserve archives',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 const cookies=[];for(const email of ['owner@files.test','client@files.test','other@files.test']){await call('register',{name:'Test',email,password:'Secure-test-12345',consent:true});const r=await call('login',{email,password:'Secure-test-12345'});cookies.push(r.headers.get('set-cookie').split(';')[0]);}
 const [admin,client,other]=cookies;db.sqlite.exec("UPDATE users SET role='admin' WHERE email='owner@files.test'");
 const leadId=(await (await call('leads',{name:'Client',contact:'client@files.test',service:'Website',description:'Build a test website',consent:true},client)).json()).id;const path='leads/'+leadId+'/attachments';
 const content='Тестовый материал';const body={filename:'Материал.txt',base64:Buffer.from(content).toString('base64')};
 assert.equal((await call(path)).status,401);assert.equal((await call(path,body,other)).status,404);
 const r=await call(path,body,client);assert.equal(r.status,201);const a=(await r.json()).attachment;assert.equal('base64' in a,false);
 const filePath='attachments/'+a.id;assert.equal((await call(filePath,undefined,other)).status,404);assert.equal((await call(filePath)).status,401);
 const download=await call(filePath,undefined,client);assert.equal(await download.text(),content);assert.equal(download.headers.get('content-type'),'application/octet-stream');assert.match(download.headers.get('content-disposition'),/^attachment;/);assert.equal(download.headers.get('x-content-type-options'),'nosniff');
 assert.equal((await call(filePath,{archived:true},client,'PUT')).status,200);assert.equal((await call(filePath,undefined,client)).status,404);assert.equal((await call(filePath,{archived:false},client,'PUT')).status,200);
 for(const invalid of [{filename:'../bad.txt'},{filename:'bad.svg'},{filename:'fake.png'},{base64:'%%%='},{base64:Buffer.from([0,1,2]).toString('base64')},{base64:''}])assert.equal((await call(path,{...body,...invalid},client)).status,400);
 const large={filename:'large.txt',base64:Buffer.alloc(524288,65).toString('base64')};assert.equal((await call(path,large,client)).status,201);assert.equal((await call(path,{...large,base64:Buffer.alloc(524289,65).toString('base64')},client)).status,400);
 const team=(await (await call(path,{filename:'team.txt',base64:body.base64},admin)).json()).attachment;assert.equal((await call('attachments/'+team.id,{archived:true},client,'PUT')).status,403);
 for(let i=0;i<7;i++)assert.equal((await call(path,{...body,filename:'file'+i+'.txt'},client)).status,201);
 assert.equal((await call(path,body,client)).status,409);const list=(await (await call(path,undefined,client)).json()).attachments;assert.equal(list.length,10);assert.equal(JSON.stringify(list).includes('base64'),false);
 assert.equal(JSON.stringify(await (await call('content')).json()).includes(a.id),false);db.sqlite.close();
});
