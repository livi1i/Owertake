import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {randomBytes,createHmac} from 'node:crypto';
const origin=process.env.TEST_ORIGIN||'http://127.0.0.1:5185';const key=JSON.parse(await readFile('.local/timeweb-config.json','utf8')).admin_key;
async function call(path,body,cookie='',method){const r=await fetch(origin+'/api/'+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),cookie},body:body?JSON.stringify(body):undefined});return{status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
const suffix=randomBytes(4).toString('hex'),pass='TestOnlyPassword-2026';const a='a-'+suffix+'@example.test',b='b-'+suffix+'@example.test';
for(const email of[a,b])assert.equal((await call('register',{name:'Timeweb test',email,password:pass,consent:true})).status,200);
const ca=(await call('login',{email:a,password:pass})).cookie,cb=(await call('login',{email:b,password:pass})).cookie;assert.ok(ca&&cb);
const lead=await call('leads',{name:'Test',contact:a,service:'Сайты',description:'Проверка переноса на PHP',consent:true},ca);assert.equal(lead.status,200);const id=lead.data.id;
assert.equal((await call('leads/'+id+'/messages',undefined,cb)).status,404);assert.equal((await call('estimates',undefined,ca)).status,403);
assert.equal((await call('leads/'+id+'/messages',{text:'Тестовое сообщение'},ca)).status,200);assert.equal((await call('leads/'+id+'/messages',undefined,ca)).data.messages.length,1);
const claim=await call('admin/claim',{key},cb);assert.equal(claim.status,200);assert.equal((await call('leads/'+id,{price:50000,status:'В работе',due:'По договору'},cb,'PATCH')).status,200);
assert.equal((await call('leads',undefined,ca)).data.leads[0].price,50000);assert.equal((await call('estimates',{title:'Тест',total:50000,data:{hours:25}},cb)).status,200);
assert.equal((await call('content',{projects:[],prices:{},contacts:{}},cb,'PUT')).status,200);
assert.equal((await call('logout',{},ca)).status,200);assert.equal((await call('leads',undefined,ca)).status,401);
const csrf=await fetch(origin+'/api/register',{method:'POST',headers:{'Content-Type':'application/json',origin:'https://invalid.example'},body:'{}'});assert.equal(csrf.status,403);
console.log('PASS: PHP registration, sessions, ownership, messages, admin, projects, calculator, content, logout and CSRF');
