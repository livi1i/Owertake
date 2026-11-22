import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildProjectQuote} from '../src/lib/project-quote.ts';

const selection = {slug:'ecommerce',preset:'ecommerce',code:'OV-009',design:'current',extras:[],urgent:false};

test('estimate uses published rates and never charges for an included feature twice', () => {
  const quote = buildProjectQuote({...selection,extras:['portal','payment','onec']},{'OV-103':'33000'});
  assert.deepEqual(quote.lines.map(item => item.code),['OV-009','OV-103']);
  assert.equal(quote.lines.reduce((sum,item) => sum+item.amount,0),57500);
  assert.match(quote.timeline,/рабочих дней/);
  assert.ok(quote.options.find(option => option.id==='payment')?.included);
});

test('premium landing updates base, includes UI components, and leaves urgent timing for approval', () => {
  const quote = buildProjectQuote({...selection,slug:'landing',preset:'landing',code:'OV-002',design:'premium',urgent:true},{});
  assert.deepEqual(quote.lines.map(item => item.code),['OV-003','OV-234']);
  assert.match(quote.timeline,/согласуем/);
  const baseTotal=quote.lines.reduce((sum,item)=>sum+item.amount,0);
  assert.equal(quote.urgentFee, Math.ceil(baseTotal*.2));
  assert.equal(quote.hasUrgentEstimate,true);
});

test('unknown project leaves quote open and recurring rates preserve their billing period', () => {
  assert.deepEqual(buildProjectQuote({...selection,slug:'',preset:'other'},{}).totals,[]);
  const quote = buildProjectQuote({...selection,slug:'hosting',preset:'other',code:'OV-301'}, {});
  assert.match(quote.totals[0],/мес/);
  const urgent = buildProjectQuote({...selection,slug:'hosting',preset:'other',code:'OV-301',urgent:true},{});
  assert.equal(urgent.urgentFee,0);
  assert.deepEqual(urgent.totals,quote.totals);
  assert.equal(quote.options.length,0);
});
