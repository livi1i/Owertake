import {offerCode,offersFor,priceLabel,type PriceOverrides} from './public-prices.ts';

export const projectPresets = [
  {id:'landing',slug:'landing',name:'Лендинг',days:[7,15]},
  {id:'corporate',slug:'corporate',name:'Корпоративный сайт',days:[12,25]},
  {id:'ecommerce',slug:'ecommerce',name:'Интернет-магазин',days:[15,30]},
  {id:'telegram',slug:'telegram',name:'Telegram-бот',days:[5,12]},
  {id:'redesign',slug:'ui-ux',name:'Редизайн',days:[10,20]},
  {id:'other',slug:'',name:'Другой проект',days:[]},
] as const;

export const designLevels = [
  {id:'current',name:'Актуальный',hint:'Подход выбранного тарифа'},
  {id:'universal',name:'Универсальный',hint:'Индивидуальная вёрстка лендинга, где доступна'},
  {id:'premium',name:'Премиальный',hint:'Дополнительная библиотека UI-компонентов'},
] as const;
export type DesignLevel = typeof designLevels[number]['id'];
export const urgentRate = 20;

export const extras = [
  {id:'alerts',name:'Уведомления о заявках',site:offerCode(110),bot:offerCode(95)},
  {id:'scenario',name:'Дополнительный сценарий',site:'',bot:offerCode(102)},
  {id:'text',name:'Текст одной страницы',site:offerCode(162),bot:''},
  {id:'language',name:'Второй язык',site:offerCode(41),bot:''},
  {id:'onec',name:'Интеграция с 1С',site:offerCode(114),bot:''},
  {id:'crm',name:'Подключение к CRM',site:offerCode(82),bot:offerCode(97)},
  {id:'payment',name:'Онлайн-оплата',site:offerCode(51),bot:offerCode(93)},
  {id:'quiz',name:'Квиз',site:offerCode(33),bot:''},
  {id:'calculator',name:'Калькулятор',site:offerCode(34),bot:''},
  {id:'portal',name:'Базовый личный кабинет',site:offerCode(69),bot:''},
] as const;

export function quoteVariants(slug:string,prices:PriceOverrides,preset:string) {
  return offersFor(slug,prices).filter(offer => preset !== 'redesign' || offer.code === offerCode(19));
}

export function buildProjectQuote(input:{slug:string;preset:string;code:string;design:DesignLevel;extras:string[];urgent:boolean},prices:PriceOverrides) {
  const bot = input.slug === 'telegram';
  const site = ['landing','corporate','ecommerce'].includes(input.slug) || input.preset === 'redesign';
  const variants = quoteVariants(input.slug,prices,input.preset);
  let base = variants.find(offer => offer.code === input.code) || variants[0];
  if (base && [offerCode(6),offerCode(7)].includes(base.code) && input.design !== 'current') base = variants.find(offer => offer.code === offerCode(8)) || base;
  const included = new Set<string>();
  if (base?.code === offerCode(17)) included.add('payment');


  if ([offerCode(15),offerCode(89),offerCode(90),offerCode(95)].includes(base?.code || '')) included.add('alerts');
  const options = extras.filter(extra => bot ? extra.bot : site && extra.site).map(extra => ({
    ...extra,included:included.has(extra.id),
    offer:[...offersFor('extra-work',prices),...offersFor('telegram',prices)].find(offer => offer.code === (bot ? extra.bot : extra.site)),
  }));
  const chosen = options.filter(option => input.extras.includes(option.id) && !option.included && option.offer);
  const uiKit = input.design === 'premium' && site ? offersFor('ui-ux',prices).find(offer => offer.code === offerCode(157)) : undefined;
  const lines = [...(base ? [base] : []),...(uiKit ? [uiKit] : []),...chosen.map(option => option.offer!)];
  const oneTimeTotal = lines.reduce((sum,offer) => sum + (offer.period==='once' ? offer.amount : 0),0);
  const urgentFee = input.urgent ? Math.ceil(oneTimeTotal * urgentRate / 100) : 0;
  const totals = (['once','month','year','hour'] as const).flatMap(period => {
    const sum = period==='once' ? oneTimeTotal + urgentFee : lines.reduce((amount,offer) => amount + (offer.period === period ? offer.amount : 0),0);
    return sum ? [priceLabel(sum,period)] : [];
  });
  const preset = projectPresets.find(item => item.id === input.preset && item.id !== 'other');
  const days = preset?.days;
  const changes = chosen.length + Number(!!uiKit);
  const timeline = days?.length && !input.urgent ? `${days[0]+changes}–${days[1]+changes*3} рабочих дней` : input.urgent ? 'Ускоренный запуск — согласуем дату' : 'После оценки задачи';
  return {base,variants,options,lines,totals,timeline,urgentFee,hasUrgentEstimate:oneTimeTotal>0};
}
