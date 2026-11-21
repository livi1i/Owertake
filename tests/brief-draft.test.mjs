import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyBrief,cleanBrief,readBriefDraft,briefError,briefDescription,DRAFT_AGE} from '../src/lib/brief-draft.ts';
test('brief drafts expire, discard unknown fields and bound total request size',()=>{
 const now=1800000000000;const d={...emptyBrief,service:'Лендинги',description:'a'.repeat(5000),context:'b'.repeat(5000),features:'c'.repeat(5000),references:'d'.repeat(5000),budget:'e'.repeat(5000),deadline:'f'.repeat(5000),consent:true};
 const cleaned=cleanBrief(d);assert.equal('consent' in cleaned,false);assert.ok(briefDescription(cleaned).length<=5000);
 assert.deepEqual(readBriefDraft(JSON.stringify({version:1,savedAt:now,data:d}),now+100),cleaned);
 for(const raw of ['bad','null','{}',JSON.stringify({version:1,savedAt:now+1,data:d}),JSON.stringify({version:2,savedAt:now,data:d})])assert.equal(readBriefDraft(raw,now),null);
 assert.equal(readBriefDraft(JSON.stringify({version:1,savedAt:now,data:d}),now+DRAFT_AGE),null);
});
test('brief validation allows optional budgets and rejects unsafe reference schemes',()=>{
 const d={...emptyBrief,service:'Лендинги',description:'Нужен сайт для нового продукта',name:'Test',contact:'@test'};
 for(let step=0;step<5;step++)assert.equal(briefError(step,d),'');
 assert.ok(briefError(1,{...d,description:'short'}));assert.ok(briefError(4,{...d,name:''}));
 for(const url of ['javascript:alert(1)','file:///etc/passwd','not a url'])assert.ok(briefError(2,{...d,references:url}));
 assert.equal(briefError(2,{...d,references:'https://example.test\nhttp://example.test'}),'');
 assert.match(briefDescription(d),/нужна оценка/);assert.match(briefDescription(d),/Нужен сайт/);
});
