import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';
import {database} from '../scripts/local-db.mjs';
test('registration, sessions, isolated projects, messages and admin access',async()=>{
 const db=database(); const env={DB:db};
 const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie,origin:'https://test.local'},body:body?JSON.stringify(body):undefined}),env);
 for(const email of ['one@example.test','two@example.test']){const r=await call('register',{email,name:'Test',password:'Secure-test-12345',consent:true});assert.equal(r.status,200)}
 const login=async email=>{const r=await call('login',{email,password:'Secure-test-12345'});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);return r.headers.get('set-cookie').split(';')[0]};
 const a=await login('one@example.test'),b=await login('two@example.test');
 const r=await call('leads',{name:'Test',contact:'one@example.test',service:'CRM',description:'Build a customer management system',consent:true},a);assert.equal(r.status,200);const {id}=await r.json();
 assert.equal((await(await call('leads',undefined,a)).json()).leads.length,1);
 assert.equal((await(await call('leads',undefined,b)).json()).leads.length,0);
 assert.equal((await call('leads/'+id+'/messages',undefined,b)).status,404);
 assert.equal((await call('leads/'+id+'/messages',{text:'Hello'},a)).status,200);
 assert.equal((await(await call('leads/'+id+'/messages',undefined,a)).json()).messages.length,1);
 assert.equal((await call('estimates',undefined,a)).status,403);
 assert.equal((await call('content',{projects:[]},a,'PUT')).status,403);
 db.sqlite.prepare("UPDATE users SET role='admin' WHERE email=?").run('two@example.test');
 assert.equal((await(await call('leads',undefined,b)).json()).leads.length,1);
 assert.equal((await call('leads/'+id,{status:'В работе',price:100000,due:'20 декабря'},b,'PATCH')).status,200);
 assert.equal((await(await call('leads',undefined,a)).json()).leads[0].price,100000);
 assert.equal((await call('estimates',{title:'CRM',data:{hours:50},total:100000},b)).status,200);
 assert.equal((await call('logout',{},a)).status,200);
 assert.equal((await call('leads',undefined,a)).status,401);
 db.sqlite.close();
});
test('cross-origin mutations and invalid inputs are rejected',async()=>{
 const db=database();
 const r=await api(new Request('https://test.local/api/register',{method:'POST',headers:{origin:'https://evil.test','Content-Type':'application/json'},body:'{}'}),{DB:db});assert.equal(r.status,403);
 const invalid=await api(new Request('https://test.local/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'x',name:'x',password:'1'})}),{DB:db});assert.equal(invalid.status,400);db.sqlite.close();
});
