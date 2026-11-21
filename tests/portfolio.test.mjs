import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectSlug,portfolioItems,filterPortfolio,portfolioConcepts} from '../src/lib/portfolio.ts';
import {api} from '../server/api.mjs';
import {database} from '../scripts/local-db.mjs';
test('portfolio separates confirmed clients from concepts and supports stable links',()=>{
 const client={title:'Подтверждённый сайт',category:'Сайты',description:'Описание',confirmed:true,slug:'client-site'};
 const list=portfolioItems([client,{...client,title:'Черновик',confirmed:false}]);assert.equal(list.length,portfolioConcepts.length+1);
 assert.equal(filterPortfolio(list,'','Все','Клиентские проекты').length,1);assert.equal(filterPortfolio(list,'','Все','Концепции').length,18);
 assert.equal(new Set(portfolioConcepts.map(p=>p.serviceSlug)).size,18);
 assert.equal(projectSlug(client),'client-site');assert.equal(projectSlug({title:'AURA Studio'}),'aura-studio');assert.equal(projectSlug({title:'Новый сайт'}),projectSlug({title:'Новый сайт'}));
 assert.equal(filterPortfolio(list,'Pulse','Telegram-боты','Концепции').length,1);
});
test('unconfirmed case text is private and publication requires an admin',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 assert.equal((await call('admin/content')).status,401);
 await call('register',{name:'Test',email:'portfolio@example.test',password:'Secure-test-12345',consent:true});const login=await call('login',{email:'portfolio@example.test',password:'Secure-test-12345'});const cookie=login.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('admin/content',undefined,cookie)).status,403);db.sqlite.exec("UPDATE users SET role='admin'");
 const project={title:'Private client',category:'Сайты',description:'Private draft text',slug:'client-test',confirmed:false};const content={projects:[project],prices:{},contacts:{}};
 assert.equal((await call('content',content,cookie,'PUT')).status,200);assert.deepEqual((await (await call('content')).json()).projects,[]);assert.equal((await (await call('admin/content',undefined,cookie)).json()).projects[0].description,project.description);
 for(const projects of [[{...project,slug:'../bad'}],[{...project,slug:'concept-corporate'}],[project,project],[{...project,slug:'aura-studio'}],[{...project,confirmed:'yes'}]])assert.equal((await call('content',{...content,projects},cookie,'PUT')).status,400);
 await call('content',{...content,projects:[{...project,confirmed:true}]},cookie,'PUT');assert.equal((await (await call('content')).json()).projects[0].title,project.title);db.sqlite.close();
});
