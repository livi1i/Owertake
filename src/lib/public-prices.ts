import {workbookGroups} from './pricebook-data.ts';

export type PricePeriod = 'once' | 'month' | 'year' | 'hour';
export type PublicOffer = { code: string; name: string; scope: string; amount: number; period: PricePeriod };
export type PriceOverrides = Readonly<Record<string, string>>;

const selection: Readonly<Record<string, readonly number[]>> = {
  'extra-work':[110,102,162,41,114,82,97,51,93,33,34,69,22,31],
  landing:[6,7,8,9,10],
  corporate:[11,12,13,14,15],
  ecommerce:[16,17,18],
  telegram:[88,89,90,91,92,94,95,96,97,99,100,101],
  automation:[126,127,128,129],
  integrations:[105,106,107,113,114,115],
  'ai-assistants':[130,131,133,134],
  'ui-ux':[155,156,157,19,158],
  branding:[141,142,146,147],
  seo:[173,174,177,180,187],
  smm:[192,193,194,196],
  'web-apps':[202,203,204,205],
  mobile:[206,207,208],
  crm:[66,67,68],
  'crm-setup':[59,60,61,62],
  support:[226,227,228,229,230],
  hosting:[237,238,243],
  domains:[239,240,241],
};

export const offerCode = (row:number) => 'P26-'+row;

function priceOverride(offer:PublicOffer, prices:PriceOverrides):PublicOffer {
  const amount = prices[offer.code];
  return typeof amount === 'string' && /^[0-9]{1,8}(?:\.[0-9]{1,2})?$/.test(amount) && Number(amount)>0
    ? {...offer,amount:Number(amount)}
    : offer;
}

const groups = workbookGroups.map(({id,name,offers})=>({
  id,name,offers:offers.map(([row,name,scope,amount,period]):PublicOffer=>({code:offerCode(row),name,scope,amount,period})),
}));
const offersByCode = new Map(groups.flatMap(group=>group.offers.map(offer=>[offer.code,offer] as const)));

export function offerAt(row:number, prices:PriceOverrides = {}):PublicOffer {
  const offer=offersByCode.get(offerCode(row));
  if (!offer) throw new Error('Unknown pricebook row: '+row);
  return priceOverride(offer,prices);
}

export function pricebook(prices:PriceOverrides = {}) {
  return groups.map(group=>({...group,offers:group.offers.map(offer=>priceOverride(offer,prices))}));
}

export function offersFor(slug:string, prices:PriceOverrides = {}):readonly PublicOffer[] {
  return Object.hasOwn(selection,slug) ? selection[slug].map(row=>offerAt(row,prices)) : [];
}

const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
const periodLabels = {once:'',month:' / мес.',year:' / год',hour:' / ч'};

export function priceLabel(amount:number, period:PricePeriod = 'once') {
  return 'от '+rubles.format(amount)+' ₽'+periodLabels[period];
}

export function offerPrice(offer:PublicOffer) {
  return rubles.format(offer.amount)+' ₽'+periodLabels[offer.period];
}

export function startingOffer(slug:string, prices?:PriceOverrides) {
  return offersFor(slug,prices)[0];
}
