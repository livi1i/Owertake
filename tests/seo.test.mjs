import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seoContent,seoResolve,seoHtml,seoPaths,seoRobots,seoSitemap,seoPublicOrigin} from '../server/seo.mjs';
import {defaultAgencyServices} from '../src/lib/services.ts';
import {defaultFaq} from '../src/lib/faq.ts';
import {portfolioConcepts} from '../src/lib/portfolio.ts';
import {database} from '../scripts/local-db.mjs';
import {api} from '../server/api.mjs';
const defaults={services:defaultAgencyServices,faq:defaultFaq,projects:portfolioConcepts};
test('SEO exposes public text and clean routes, omits drafts and returns real missing pages',async()=>{
 const db=database();const put=(id,data)=>db.sqlite.prepare('INSERT INTO content(id,data) VALUES (?,?)').run(id,JSON.stringify(data));
 put('public',{contacts:{address:'Псков, тестовый офис'},projects:[{title:'Private project',description:'private',confirmed:false},{title:'Approved',slug:'approved',description:'Approved text',confirmed:true}]});
 put('service:landing',{slug:'landing',status:'Скрыта',description:'Hidden service text'});put('faq:cost',{id:'cost',published:false,answer:'Hidden answer'});put('attachment:private',{base64:'private-file-data'});
 const data=await seoContent(db,defaults);assert.equal(JSON.stringify(data).includes('private-file-data'),false);assert.equal(seoResolve('/services/landing',data).status,404);assert.equal(seoResolve('/unknown',data).status,404);assert.equal(seoResolve('/services/corporate',data).redirect,'/services?product=corporate');assert.equal(seoResolve('/portfolio/approved',data).status,200);
 const paths=seoPaths(data);assert.equal(paths.some(p=>p.startsWith('/services/')),false);assert.equal(paths.includes('/pricing'),false);assert.equal(paths.some(p=>p.includes('Private')),false);for(const p of ['/account','/admin','/brief','/privacy'])assert.equal(paths.includes(p),false);
 assert.equal(seoResolve('/account',data).index,false);assert.match(seoResolve('/contacts',data).body,/Псков, тестовый офис/);assert.equal(seoResolve('/faq',data).body.includes('Hidden answer'),false);assert.match(seoSitemap(data,seoPublicOrigin),/<urlset/);assert.match(seoRobots('http://127.0.0.1:5178'),/Disallow: \/\n/);db.sqlite.close();
});
test('metadata and structured data are escaped and local preview remains noindex',async()=>{
 const data=await seoContent(null,defaults);data.overrides['/services']={title:'Title </title><script>alert(1)</script>',description:'Quote " & text'};const page=seoResolve('/services',data);const source='<!doctype html><head><title>Old</title><meta name="description" content="Old"></head><div id="root"></div>';
 const html=seoHtml(source,'/services',page,'http://127.0.0.1:5178');assert.ok(!html.includes('<script>alert(1)</script>'));assert.match(html,/&lt;\/title&gt;/);assert.match(html,/noindex,nofollow/);assert.match(html,/application\/ld\+json/);assert.match(html,/Telegram-боты/);assert.match(html,/canonical/);assert.equal((html.match(/<title>/g)||[]).length,1);
 assert.match(seoHtml(source,'/services',page,seoPublicOrigin),/index,follow/);assert.match(seoHtml(source,'/privacy',seoResolve('/privacy',data),seoPublicOrigin),/noindex,nofollow/);
});
test('only admins can edit bounded metadata for public routes',async()=>{
 const db=database();const call=(path,body,cookie='',method)=>api(new Request('https://test.local/api/'+path,{method:method||(body?'POST':'GET'),headers:{'Content-Type':'application/json',cookie},body:body?JSON.stringify(body):undefined}),{DB:db});
 assert.equal((await call('admin/seo')).status,401);await call('register',{name:'Test',email:'seo@example.test',password:'Secure-test-12345',consent:true});const login=await call('login',{email:'seo@example.test',password:'Secure-test-12345'});const cookie=login.headers.get('set-cookie').split(';')[0];assert.equal((await call('admin/seo',undefined,cookie)).status,403);db.sqlite.exec("UPDATE users SET role='admin'");
 const body={path:'/services',title:'Custom title',description:'Custom description'};assert.equal((await call('admin/seo',body,cookie,'PUT')).status,200);const data=await seoContent(db,defaults);assert.equal(seoResolve('/services',data).title,body.title);
 for(const change of [{path:'/admin'},{path:'/services/../../admin'},{title:'a'.repeat(161)},{description:123}])assert.equal((await call('admin/seo',{...body,...change},cookie,'PUT')).status,400);db.sqlite.close();
});
