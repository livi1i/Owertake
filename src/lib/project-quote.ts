import {offersFor,priceLabel,type PriceOverrides} from './public-prices.ts';

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
  {id:'alerts',name:'Уведомления о заявках',site:'OV-065',bot:'OV-198'},
  {id:'scenario',name:'Дополнительный сценарий',site:'',bot:'OV-202'},
  {id:'text',name:'Текст под ключ',site:'OV-412',bot:''},
  {id:'language',name:'Второй язык',site:'OV-060',bot:''},
  {id:'onec',name:'Интеграция с 1С',site:'OV-103',bot:''},
  {id:'crm',name:'Подключение к CRM',site:'OV-175',bot:'OV-179'},
  {id:'payment',name:'Онлайн-оплата',site:'OV-529',bot:'OV-209'},
  {id:'quiz',name:'Квиз',site:'OV-043',bot:''},
  {id:'calculator',name:'Калькулятор',site:'OV-044',bot:''},
  {id:'news',name:'Блог / новости',site:'OV-046',bot:''},
  {id:'portal',name:'Личный кабинет',site:'OV-077',bot:''},
] as const;

export function quoteVariants(slug:string,prices:PriceOverrides,preset:string) {
  return offersFor(slug,prices).filter(offer => preset !== 'redesign' || offer.code === 'OV-015');
}

export function buildProjectQuote(input:{slug:string;preset:string;code:string;design:DesignLevel;extras:string[];urgent:boolean},prices:PriceOverrides) {
  const bot = input.slug === 'telegram';
  const site = ['landing','corporate','ecommerce'].includes(input.slug) || input.preset === 'redesign';
  const variants = quoteVariants(input.slug,prices,input.preset);
  let base = variants.find(offer => offer.code === input.code) || variants[0];
  if (base?.code === 'OV-002' && input.design !== 'current') base = variants.find(offer => offer.code === 'OV-003') || base;
  const included = new Set<string>();
  if (['OV-008','OV-009'].includes(base?.code || '')) included.add('payment');
  if (base?.code === 'OV-009') included.add('portal');
  if (['OV-006'].includes(base?.code || '')) included.add('news');
  if (['OV-010','OV-191','OV-192','OV-194','OV-198'].includes(base?.code || '')) included.add('alerts');
  const options = extras.filter(extra => bot ? extra.bot : site && extra.site).map(extra => ({
    ...extra,included:included.has(extra.id),
    offer:[...offersFor('extra-work',prices),...offersFor('telegram',prices)].find(offer => offer.code === (bot ? extra.bot : extra.site)),
  }));
  const chosen = options.filter(option => input.extras.includes(option.id) && !option.included && option.offer);
  const uiKit = input.design === 'premium' && site ? offersFor('ui-ux',prices).find(offer => offer.code === 'OV-234') : undefined;
  const lines = [...(base ? [base] : []),...(uiKit ? [uiKit] : []),...chosen.map(option => option.offer!)];
  const oneTimeTotal = lines.reduce((sum,offer) => sum + (offer.period==='once' ? offer.amount : 0),0);
  const urgentFee = input.urgent ? Math.ceil(oneTimeTotal * urgentRate / 100) : 0;
  const totals = (['once','month','year'] as const).flatMap(period => {
    const sum = period==='once' ? oneTimeTotal + urgentFee : lines.reduce((amount,offer) => amount + (offer.period === period ? offer.amount : 0),0);
    return sum ? [priceLabel(sum,period)] : [];
  });
  const preset = projectPresets.find(item => item.id === input.preset && item.id !== 'other');
  const days = preset?.days;
  const changes = chosen.length + Number(!!uiKit);
  const timeline = days?.length && !input.urgent ? `${days[0]+changes}–${days[1]+changes*3} рабочих дней` : input.urgent ? 'Ускоренный запуск — согласуем дату' : 'После оценки задачи';
  return {base,variants,options,lines,totals,timeline,urgentFee,hasUrgentEstimate:oneTimeTotal>0};
}
