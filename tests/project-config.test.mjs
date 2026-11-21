import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectSchema,normalizeProject,projectSummary,complexities,urgencies} from '../src/lib/project-config.ts';
test('project parameters constrain volume and remove features from other directions',()=>{
 const base={volume:2.6,complexity:'invalid',urgency:'invalid',features:['Корзина и заказ','База знаний','Корзина и заказ','unknown']};
 const web=normalizeProject('Сайты',base);assert.equal(web.volume,3);assert.deepEqual(web.features,['Корзина и заказ']);assert.equal(web.complexity,complexities[0]);assert.equal(web.urgency,urgencies[0]);
 assert.deepEqual(normalizeProject('ИИ',base).features,['База знаний']);
 for(const [value,expected] of [[-4,1],[101,100],[NaN,1],[Infinity,1]])assert.equal(normalizeProject('Сайты',{...base,volume:value}).volume,expected);
});
test('summary carries service, volume, features and conditions without invented prices',()=>{
 const text=projectSummary({name:'Telegram-боты',category:'Боты и автоматизация'},{volume:5,features:['Запись и бронирование','Онлайн-оплата'],complexity:complexities[1],urgency:urgencies[1]});
 assert.match(text,/Telegram-боты/);assert.match(text,/Рабочие сценарии: 5/);assert.match(text,/Запись и бронирование/);assert.doesNotMatch(text,/Онлайн-оплата|₽/);assert.match(text,/Повышенная/);assert.match(text,/Ускоренный запуск/);assert.match(text,/Тарифы пока не опубликованы/);
 assert.ok(projectSchema('custom-category').features.length);
});
