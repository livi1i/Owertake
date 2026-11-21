import {test} from 'node:test';
import assert from 'node:assert/strict';
import {necessaryChoice,parseCookieChoice,COOKIE_MAX_AGE} from '../src/lib/cookie-preferences.ts';
test('cookie preference expires and never grants unknown or optional permissions',()=>{
 const now=1800000000000;
 const value=necessaryChoice(now);
 assert.deepEqual(parseCookieChoice(JSON.stringify(value),now+100),value);
 for(const raw of [null,'invalid','{}','null',JSON.stringify({...value,version:0}),JSON.stringify({...value,analytics:true}),JSON.stringify({...value,marketing:true}),JSON.stringify({...value,necessary:false}),JSON.stringify({...value,savedAt:now+1}),JSON.stringify({...value,savedAt:'today'})])assert.equal(parseCookieChoice(raw,now),null);
 assert.equal(parseCookieChoice(JSON.stringify(value),now+COOKIE_MAX_AGE),null);
 assert.ok(parseCookieChoice(JSON.stringify(value),now+COOKIE_MAX_AGE-1));
});
