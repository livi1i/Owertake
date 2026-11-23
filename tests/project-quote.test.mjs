import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildProjectQuote} from '../src/lib/project-quote.ts';
import {offerAt,pricebook} from '../src/lib/public-prices.ts';

const selection = {slug:'ecommerce',preset:'ecommerce',code:'P26-17',design:'current',extras:[],urgent:false};

test('approved workbook prices and quantities carry through to the project estimate', () => {
  const groups=pricebook();
  assert.equal(groups.length,16);
  assert.equal(groups.flatMap(group=>group.offers).length,230);
  assert.equal(offerAt(51).amount,6900);
  assert.equal(offerAt(222).period,'hour');
  assert.equal(offerAt(226).period,'month');
  assert.equal(offerAt(237).period,'year');
  const quote = buildProjectQuote({...selection,extras:['payment','onec']},{'P26-114':'21000','OV-009':'1500'});
  assert.deepEqual(quote.lines.map(item => item.code),['P26-17','P26-114']);
  assert.equal(quote.lines.reduce((sum,item) => sum+item.amount,0),48900);
  assert.match(quote.timeline,/рабочих дней/);
  assert.ok(quote.options.find(option => option.id==='payment')?.included);
  const start=buildProjectQuote({...selection,code:'P26-16',extras:['payment']},{});
  assert.deepEqual(start.lines.map(item=>item.amount),[8900,6900]);
});

test('premium landing updates base, includes UI components, and leaves urgent timing for approval', () => {
  const quote = buildProjectQuote({...selection,slug:'landing',preset:'landing',code:'P26-7',design:'premium',urgent:true},{});
  assert.deepEqual(quote.lines.map(item => item.code),['P26-8','P26-157']);
  assert.match(quote.timeline,/согласуем/);
  const baseTotal=quote.lines.reduce((sum,item)=>sum+item.amount,0);
  assert.equal(quote.urgentFee, Math.ceil(baseTotal*.2));
  assert.equal(quote.hasUrgentEstimate,true);
});

test('unknown project leaves quote open and recurring rates preserve their billing period', () => {
  assert.deepEqual(buildProjectQuote({...selection,slug:'',preset:'other'},{}).totals,[]);
  const quote = buildProjectQuote({...selection,slug:'hosting',preset:'other',code:'P26-237'}, {});
  assert.match(quote.totals[0],/год/);
  const urgent = buildProjectQuote({...selection,slug:'hosting',preset:'other',code:'P26-237',urgent:true},{});
  assert.equal(urgent.urgentFee,0);
  assert.deepEqual(urgent.totals,quote.totals);
  assert.equal(quote.options.length,0);
});
