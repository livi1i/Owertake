import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultFaq,mergeFaq,searchFaq} from '../src/lib/faq.ts';
import {database} from '../scripts/local-db.mjs';
import {api} from '../server/api.mjs';
test('FAQ search covers answers and categories, hidden overrides stay hidden',()=>{
 assert.equal(defaultFaq.length,17);
 assert.ok(searchFaq(defaultFaq,'ПСКОВЕ','Все').some(x=>x.id==='meeting'));
 assert.ok(searchFaq(defaultFaq,'репозиторию','Код и права').some(x=>x.id==='source'));
 assert.equal(searchFaq(defaultFaq,'несуществующийвопрос','Все').length,0);
 assert.equal(searchFaq(mergeFaq([{id:'cost',published:false}]),'','Все').some(x=>x.id==='cost'),false);
});
test('FAQ API protects editing and does not expose hidden drafts',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 const item={id:'private-answer',question:'Private question',answer:'Private answer',category:'Сотрудничество',published:false};
 assert.equal((await call('admin/faq')).status,401);
 await call('register',{name:'Test',email:'faq@example.test',password:'Secure-test-12345',consent:true});
 const login=await call('login',{email:'faq@example.test',password:'Secure-test-12345'});const cookie=login.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('admin/faq',item,cookie,'PUT')).status,403);
 db.sqlite.exec("UPDATE users SET role='admin'");
 for(const change of [{id:'../bad'},{published:'yes'},{answer:''},{question:'x'.repeat(201)},{category:'unknown'}])assert.equal((await call('admin/faq',{...item,...change},cookie,'PUT')).status,400);
 assert.equal((await call('admin/faq',item,cookie,'PUT')).status,200);
 assert.deepEqual((await (await call('faq')).json()).faq,[{id:item.id,published:false}]);
 assert.equal((await (await call('admin/faq',undefined,cookie)).json()).faq[0].answer,item.answer);
 await call('admin/faq',{...item,published:true},cookie,'PUT');assert.equal((await (await call('faq')).json()).faq[0].answer,item.answer);
 assert.equal((await call('content')).status,200);db.sqlite.close();
});
