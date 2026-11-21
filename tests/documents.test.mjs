import {test} from 'node:test';
import assert from 'node:assert/strict';
import {database} from '../scripts/local-db.mjs';
import {api} from '../server/api.mjs';
test('documents preserve versions, isolate clients and publish only reviewed snapshots',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 const cookies=[];for(const email of ['owner@docs.test','client@docs.test','other@docs.test']){await call('register',{name:'Test',email,password:'Secure-test-12345',consent:true});const r=await call('login',{email,password:'Secure-test-12345'});cookies.push(r.headers.get('set-cookie').split(';')[0]);}
 const [admin,client,other]=cookies;db.sqlite.exec("UPDATE users SET role='admin' WHERE email='owner@docs.test'");
 const lead=(await (await call('leads',{name:'Client',contact:'client@docs.test',service:'Website',description:'Build a test website',consent:true},client)).json()).id;
 const body={leadId:lead,title:'First title',kind:'Смета',text:'Private first version'};
 assert.equal((await call('documents')).status,401);assert.equal((await call('documents',body,client)).status,403);
 assert.equal((await call('documents',{...body,leadId:'missing'},admin)).status,404);
 const created=await call('documents',body,admin);assert.equal(created.status,201);let d=(await created.json()).document;const path='documents/'+d.id;
 assert.equal((await call(path,undefined,client)).status,404);assert.equal((await (await call('documents',undefined,client)).json()).documents.length,0);
 const act=(action,extra={})=>call(path,{action,expectedVersion:d.versions.at(-1).version,expectedPublishedVersion:d.publishedVersion,...extra},admin,'PUT');
 assert.equal((await act('publish')).status,400);d=(await (await act('publish',{reviewed:true})).json()).document;
 assert.equal((await call(path,undefined,other)).status,404);assert.equal((await call(path,{action:'withdraw'},client,'PUT')).status,403);
 d=(await (await act('revise',{title:'Secret next title',text:'Secret second version'})).json()).document;
 let visible=(await (await call(path,undefined,client)).json()).document;assert.equal(visible.title,'First title');assert.equal(visible.versions.length,1);assert.equal(visible.versions[0].text,body.text);assert.equal(JSON.stringify(visible).includes('Secret'),false);
 assert.equal((await call(path,{action:'withdraw',expectedVersion:1,expectedPublishedVersion:1},admin,'PUT')).status,409);
 d=(await (await act('publish',{reviewed:true})).json()).document;visible=(await (await call(path,undefined,client)).json()).document;assert.equal(visible.title,'Secret next title');assert.equal(visible.versions[0].version,2);
 assert.equal(d.versions[0].text,body.text);assert.equal((await act('withdraw')).status,200);assert.equal((await call(path,undefined,client)).status,404);
 const again=(await (await call('documents',body,admin)).json()).document;assert.notEqual(again.number,d.number);assert.equal(JSON.stringify(await (await call('content')).json()).includes('Private first version'),false);db.sqlite.close();
});
