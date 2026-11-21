import {useState} from 'react';
import {ArrowUpRight,MapPin} from 'lucide-react';

export function OfficeMap({address}:{address:string}) {
  const [open,setOpen] = useState(false);
  const place = address.trim();
  if (!place) return null;
  const params = new URLSearchParams({text:place});
  return <section className="office-map" aria-label="Офис на карте">
    <div className="office-map-preview">
      {open ? <iframe title="Офис OVERTAKE на Яндекс Картах" src={'https://yandex.ru/map-widget/v1/?'+params} loading="lazy" referrerPolicy="no-referrer"/> :
        <button className="office-map-open" type="button" onClick={() => setOpen(true)}><span className="office-pin"><MapPin size={29}/></span> Показать карту</button>}
    </div>
    <div className="office-map-address">
      <div><strong>{place}</strong><span>Время встречи согласуем заранее.</span></div>
      <a href={'https://yandex.ru/maps/?'+params} target="_blank" rel="noopener noreferrer" aria-label="Открыть адрес в Яндекс Картах"><ArrowUpRight size={17}/></a>
    </div>
  </section>;
}
