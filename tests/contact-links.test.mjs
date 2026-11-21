import {test} from 'node:test';
import assert from 'node:assert/strict';
import {contactEmail,contactTelegram} from '../src/lib/contact-links.ts';
import {api} from '../server/api.mjs';
import {database} from '../scripts/local-db.mjs';
test('contact links allow configured channels without allowing arbitrary URL schemes',()=>{
 assert.equal(contactTelegram('@overtake_test'),'https://t.me/overtake_test');
 assert.equal(contactTelegram('https://t.me/overtake_test'),'https://t.me/overtake_test');
 for(const value of ['','javascript:alert(1)','https://example.test','https://t.me/../admin','@test?x=1'])assert.equal(contactTelegram(value),null);
 assert.equal(contactEmail('hello@example.test'),'mailto:hello%40example.test');
 for(const value of ['', 'wrong', 'hello@example.test\r\nBcc:other@example.test'])assert.equal(contactEmail(value),null);
 assert.ok(contactEmail('hello?x@example.test').startsWith('mailto:hello%3Fx'));
});
test('contacts can remain blank and configured fields persist with text validation',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 const content={projects:[],prices:{},contacts:{email:'',telegram:'',address:'',hours:''}};
 assert.equal((await call('content',content,'','PUT')).status,401);
 await call('register',{name:'Test',email:'contacts@example.test',password:'Secure-test-12345',consent:true});
 const login=await call('login',{email:'contacts@example.test',password:'Secure-test-12345'});const cookie=login.headers.get('set-cookie').split(';')[0];db.sqlite.exec("UPDATE users SET role='admin'");
 assert.equal((await call('content',content,cookie,'PUT')).status,200);
 assert.deepEqual((await (await call('content')).json()).contacts,content.contacts);
 assert.equal((await call('content',{...content,contacts:{email:{bad:true}}},cookie,'PUT')).status,400);
 assert.equal((await call('content',{...content,contacts:{hours:'x'.repeat(1001)}},cookie,'PUT')).status,400);
 const updated={...content,contacts:{...content.contacts,telegram:'@example_test',hours:'По предварительной договорённости'}};
 assert.equal((await call('content',updated,cookie,'PUT')).status,200);assert.deepEqual((await (await call('content')).json()).contacts,updated.contacts);db.sqlite.close();
});
