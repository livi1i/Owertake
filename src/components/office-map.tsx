/// <reference types="vite/client" />
import {ArrowUpRight,MapPin} from 'lucide-react';
import officeImage from '../assets/pskov-office-map.webp?inline';

export function OfficeMap({address,compact=false}:{address:string;compact?:boolean}) {
  const place = address.trim();
  if (!place) return null;
  const onMap = /псков/i.test(place) && /белинского[^\d]*74(?:[^\p{L}\d]|$)/iu.test(place);
  const params = new URLSearchParams(onMap ? {ll:'28.345079,57.831131',pt:'28.345079,57.831131,pm2blm',z:'17'} : {text:place});
  return <section className={compact?'office-map office-map-compact':'office-map'} aria-label="Офис на карте">
    <a className="office-map-link" href={'https://yandex.ru/maps/?'+params} target="_blank" rel="noopener noreferrer" aria-label={'Открыть на карте: '+place}>
      {onMap && <span className="office-map-preview"><img src={officeImage} alt="" width={960} height={400} loading="lazy"/><span className="office-map-marker"><MapPin size={compact?17:24}/></span></span>}
      <span className="office-map-address"><span><strong>{place}</strong><small>Открыть маршрут</small></span><ArrowUpRight size={16}/></span>
    </a>
    {onMap && <a className="office-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>}
  </section>;
}
