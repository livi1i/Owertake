import {offerAt,offerCode} from './public-prices.ts';

export const packages = [
  {slug:'landing',row:8,name:'Лендинг под ключ',audience:'Для запуска продукта или отдельной услуги'},
  {slug:'corporate',row:11,name:'Корпоративный сайт',audience:'Для компании с несколькими направлениями'},
  {slug:'ecommerce',row:16,name:'Интернет-магазин',audience:'Для первых продаж онлайн'},
  {slug:'telegram',row:89,name:'Telegram для заявок',audience:'Для приёма обращений в Telegram'},
  {slug:'crm-setup',row:59,name:'Старт в CRM',audience:'Для небольшого отдела продаж'},
  {slug:'support',row:227,name:'Поддержка сайта',audience:'Для проекта, который уже работает'},
].map(({row,...bundle})=>({...bundle,code:offerCode(row),included:[offerAt(row).scope]}));
