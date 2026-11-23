import {ArrowRight,ClipboardList,Code2,MessageCircle,Rocket} from 'lucide-react';
import {Reveal} from './reveal';

const steps = [
  {Icon:MessageCircle,title:'Знакомимся',text:'Обсуждаем цели онлайн, в офисе агентства или у вас. Уточняем, как проект должен работать после запуска.'},
  {Icon:ClipboardList,title:'Договариваемся',text:'Записываем пожелания в бриф, считаем стоимость и сроки, готовим договор и выставляем счёт.'},
  {Icon:Code2,title:'Создаём',text:'Проектируем, разрабатываем и показываем промежуточный результат. Согласуем правки и подключаем нужные интеграции.'},
  {Icon:Rocket,title:'Запускаем',text:'Тестируем, публикуем, передаём доступы и инструкции. Согласуем поддержку и развитие после запуска.'},
];

const compactNotes = ['Уточняем цели и задачу.','Согласуем смету, сроки и договор.','Разрабатываем и показываем результат.','Передаём проект и помогаем развивать.'];

export function ProcessSteps({compact=false}:{compact?:boolean}) {
  return <section className="section studio-process" id="approach" aria-labelledby="approach-title">
    <Reveal><div className="studio-section-head"><h2 id="approach-title">Как мы работаем</h2>{!compact && <p>На каждом этапе вы видите результат и знаете, что дальше.</p>}</div></Reveal>
    <ol className="studio-process-grid">
      {steps.map(({Icon,title,text},index) => <li key={title}>
        <Reveal delay={index*95}>
          <article className="studio-step">
            <div className="studio-step-top"><span className="studio-glyph studio-step-icon" aria-hidden="true"><Icon size={23}/></span><span className="studio-step-number">0{index+1}</span></div>
            <h3>{title}</h3><p>{compact?compactNotes[index]:text}</p>
            {index<steps.length-1 && <span className="studio-step-arrow" aria-hidden="true"><ArrowRight size={17}/></span>}
          </article>
        </Reveal>
      </li>)}
    </ol>
  </section>;
}
