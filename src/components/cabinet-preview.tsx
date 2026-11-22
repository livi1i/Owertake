import {useEffect,useRef,useState} from 'react';
import {useInView,useReducedMotion} from 'motion/react';
import {Check,FileCheck2,LayoutDashboard,MessageSquare} from 'lucide-react';

const stages = [
  {name:'Структура',status:'Проектирование',message:'Готовим схему страниц и сценарий заявки.'},
  {name:'Дизайн',status:'На согласовании',message:'Макеты готовы. Собираем обратную связь.'},
  {name:'Разработка',status:'В разработке',message:'Макеты согласованы. Собираем страницы.'},
  {name:'Проверка',status:'Тестируем',message:'Проверяем формы, ссылки и мобильную версию.'},
  {name:'Запуск',status:'Публикуем',message:'Размещаем сайт и проверяем его на рабочем домене.'},
  {name:'Готово',status:'Проект готов',message:'Передаём доступы и инструкции. Проект опубликован.'},
];

export function CabinetPreview({paused}:{paused:boolean}) {
  const frame = useRef<HTMLDivElement>(null);
  const visible = useInView(frame,{amount:.35});
  const reduce = useReducedMotion();
  const [index,setIndex] = useState(0);
  const [manual,setManual] = useState(false);
  useEffect(() => {
    if (!visible || manual || paused || reduce || index===stages.length-1) return;
    const timer = window.setTimeout(() => setIndex(current => current+1),3300);
    return () => window.clearTimeout(timer);
  },[index,visible,manual,paused,reduce]);
  const stage = stages[index];
  return <div ref={frame} className="studio-product-frame" aria-label="Пример интерфейса личного кабинета">
    <div className="studio-product-toolbar"><span aria-hidden="true"><i/><i/><i/></span><b>Личный кабинет</b><small>Демо</small></div>
    <div className="studio-product-body">
      <div className="studio-product-sidebar" aria-hidden="true"><LayoutDashboard size={17}/><MessageSquare size={17}/><FileCheck2 size={17}/></div>
      <div className="studio-product-content">
        <div><strong>Проект компании</strong><span className="studio-status" key={stage.status}><i/> {stage.status}</span></div>
        <ol className="demo-stage-list" data-cycle={visible && !manual && !paused && !reduce && index<stages.length-1||undefined} aria-label="Этапы демонстрационного проекта">{stages.map(({name},position) => <li key={name} data-current={position===index||undefined} data-complete={position<index||undefined}>
          <button type="button" aria-pressed={position===index} onClick={() => {setIndex(position);setManual(true);}}>
            <span className="demo-stage-dot" aria-hidden="true">{(position<index || index===stages.length-1) && <Check size={14}/>}</span>{name}
          </button>
          <span className="demo-stage-meter" key={name+'-'+index} aria-hidden="true"><i/></span>
        </li>)}</ol>
        <div className="studio-product-message" key={stage.message}><MessageSquare size={17}/><span>{stage.message}</span></div>
      </div>
    </div>
  </div>;
}
