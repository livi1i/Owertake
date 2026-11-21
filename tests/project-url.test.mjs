import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectUrl} from '../src/lib/project-url.ts';
test('portfolio links permit public HTTPS without credentials or local targets',()=>{
 assert.equal(projectUrl('https://amoreterno.ru/#lead').hostname,'amoreterno.ru');
 assert.equal(projectUrl('https://holodilka60.ru/').href,'https://holodilka60.ru/');
 for(const url of [undefined,'javascript:alert(1)','http://example.com','https://user:pass@example.com/','https://localhost/','https://host.local/','https://127.0.0.1/','https://[::1]/','broken'])assert.equal(projectUrl(url),null,url);
});
