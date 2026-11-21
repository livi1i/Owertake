import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterLeads,groupClients,crmSummary,defaultLeadFilters} from '../src/lib/crm.ts';
const lead=(id,extra={})=>({id,user_id:null,name:'Test',contact:'contact@example.test',service:'Сайты',description:'Нужен интернет-магазин',status:'Заявка получена',price:0,due:'',created:'2026-11-16T12:00:00Z',...extra});
test('CRM filters combine search, inclusive dates, service and status without mutating input',()=>{
 const rows=[lead('a',{created:'2026-11-15T12:00:00Z'}),lead('b',{status:'В работе',service:'Telegram-боты'}),lead('c',{status:'Завершён',created:'2026-11-17T12:00:00Z'})];
 assert.deepEqual(filterLeads(rows,{...defaultLeadFilters,from:'2026-11-16',to:'2026-11-16'}).map(l=>l.id),['b']);
 assert.deepEqual(filterLeads(rows,{...defaultLeadFilters,status:'В работе',service:'Telegram-боты',query:'ИНТЕРНЕТ-магазин'}).map(l=>l.id),['b']);
 assert.equal(filterLeads(rows,{...defaultLeadFilters,query:'nobody'}).length,0);
 assert.deepEqual(filterLeads(rows,{...defaultLeadFilters,sort:'oldest'}).map(l=>l.id),['a','b','c']);
 assert.deepEqual(rows.map(l=>l.id),['a','b','c']);
 assert.equal(filterLeads(rows,{...defaultLeadFilters,from:'2026-11-17',to:'2026-11-15'}).length,0);
});
test('client grouping separates guest claims from accounts and summary counts real statuses',()=>{
 const rows=[lead('a',{user_id:'u1'}),lead('b',{user_id:'u1',contact:'new@example.test',status:'В работе'}),lead('c'),lead('d',{contact:' CONTACT@example.test ',status:'Завершён'}),lead('e',{user_id:'u2'}),lead('f',{contact:'+7 (951) 111-22-33'}),lead('g',{contact:'+79511112233'})];
 const groups=groupClients(rows);assert.equal(groups.length,4);assert.equal(groups.find(g=>g.key==='account:u1').leads.length,2);assert.equal(groups.find(g=>g.key==='contact:contact@example.test').leads.length,2);
 const s=crmSummary(rows);assert.equal(s.total,7);assert.equal(s.newCount,5);assert.equal(s.completed,1);assert.equal(s.clients,4);assert.equal(s.statuses.reduce((sum,[,n])=>sum+n,0),7);assert.equal(s.services[0][1],7);
 assert.equal(groupClients([lead('empty1',{contact:''}),lead('empty2',{contact:''})]).length,2);
 assert.equal(crmSummary([]).total,0);
});
