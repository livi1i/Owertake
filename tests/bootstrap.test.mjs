import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';
import {database} from '../scripts/local-db.mjs';
test('owner setup requires session and secret and can only be used once',async()=>{
 const db=database();const env={DB:db,ADMIN_SETUP_KEY:'test-only-key'};
 const call=(path,body,cookie='')=>api(new Request('https://test.local/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify(body)}),env);
 assert.equal((await call('admin/claim',{key:'test-only-key'})).status,401);
 await call('register',{name:'Owner',email:'owner@example.test',password:'TestPassword-123',consent:true});
 const r=await call('login',{email:'owner@example.test',password:'TestPassword-123'});const cookie=r.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('admin/claim',{key:'wrong'},cookie)).status,403);
 assert.equal((await call('admin/claim',{key:'test-only-key'},cookie)).status,200);
 assert.equal((await call('admin/claim',{key:'test-only-key'},cookie)).status,409);
 assert.equal(db.sqlite.prepare('SELECT role FROM users').get().role,'admin');db.sqlite.close();
});
