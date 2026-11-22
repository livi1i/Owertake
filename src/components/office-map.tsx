import {MapPin} from 'lucide-react';

function yandexParams(address:string) {
  return /псков/i.test(address) && /белинского[^\d]*74(?:[^\p{L}\d]|$)/iu.test(address)
    ? new URLSearchParams({ll:'28.345079,57.831131',pt:'28.345079,57.831131,pm2blm',z:'17',l:'map'})
    : new URLSearchParams({text:address});
}

export function OfficeMap({address,compact=false}:{address:string;compact?:boolean}) {
  const place = address.trim();
  if (!place) return null;
  const params = yandexParams(place);

  return <section className={'office-map yandex-office'+(compact?' office-map-inline':'')} aria-label="Офис на карте">
    <div className="yandex-office-heading">
      <div><MapPin size={19}/><strong>{place}</strong></div>
      <a className="secondary-panel" href={'https://yandex.ru/maps/?'+params} target="_blank" rel="noopener noreferrer">Открыть в Яндекс Картах </a>
    </div>
    <iframe title="Офис OVERTAKE на Яндекс Картах" src={'https://yandex.ru/map-widget/v1/?'+params} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
  </section>;
}
