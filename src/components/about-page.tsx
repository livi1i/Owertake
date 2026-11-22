/// <reference types="vite/client" />
import {ArrowLeft,Code2,FileText,Headphones,Layers,Server} from 'lucide-react';
import {Reveal} from './reveal';
import {ProcessSteps} from './process-steps';
import {LeadSection} from './lead-section';
import togetherImage from '../assets/studio-partnership.webp?inline';

const principles = [
  {Icon:Layers,title:'От сайта до CRM',text:'Дизайн, разработка и продвижение работают на одну задачу. Связываем продукт с тем, чем команда уже пользуется.'},
  {Icon:FileText,title:'Прозрачная цена',text:'Показываем базовые цены, обсуждаем состав и сроки. Работы, оплату и правки фиксируем в договоре.'},
  {Icon:Server,title:'Хостинг под проект',text:'Подбираем инфраструктуру, настраиваем домен и размещаем продукт. Согласуем, у кого будут доступы.'},
  {Icon:Headphones,title:'Поддержка и развитие',text:'После запуска можем обновлять, исправлять ошибки и развивать новые функции по согласованному плану.'},
];

export function AboutPage({contacts}:{contacts:Record<string,string>}) {
  return <main id="main" className="catalog-page about-page">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner" data-enter>
      <div><h1>Два основателя.<br/>Одна команда.</h1><p>OVERTAKE — цифровое агентство из Пскова. Создаём сайты, ботов и приложения и остаёмся на связи после запуска.</p><a className="secondary-panel" href="#request">Обсудить проект</a></div>
      <img className="page-brand-image" src={togetherImage} alt="" width={900} height={600}/>
    </header>
    <section className="studio-inner-section">
      <Reveal><div className="studio-section-head"><h2>Почему OVERTAKE</h2><p>Вы обсуждаете задачу с людьми, которые ведут проект.</p></div></Reveal>
      <div className="about-principles">
        {principles.map(({Icon,title,text},index) => <Reveal key={title} delay={index*55}><article className="studio-service-card"><span className="studio-glyph"><Icon size={24}/></span><h3>{title}</h3><p>{text}</p></article></Reveal>)}
      </div>
    </section>
    <section className="studio-inner-section comparison-section">
      <Reveal><div className="studio-section-head"><h2>Как выбрать подход</h2><p>Например, сайту с заявками, записью и подключением CRM нужно связать три разных сценария.</p></div></Reveal>
      <div className="studio-comparison">
        <Reveal><article className="studio-step"><h3>Конструктор</h3><p>Подходит, когда задачу закрывают готовые блоки и интеграции. Обновления платформы ведёт поставщик.</p></article></Reveal>
        <Reveal delay={55}><article className="studio-step"><h3>Фрилансер</h3><p>Один специалист удобно закрывает отдельную задачу. Для дизайна, сервера и CRM могут потребоваться разные исполнители.</p></article></Reveal>
        <Reveal delay={110}><article className="studio-step featured"><h3>OVERTAKE</h3><p>Одна команда отвечает за интерфейс, разработку, размещение и согласованные интеграции. Можно продолжить работу после запуска.</p></article></Reveal>
      </div>
    </section>
    <section className="studio-inner-section project-base">
      <Reveal><div className="studio-section-head"><h2>Что входит в проект</h2><span className="studio-glyph" aria-hidden="true"><Code2 size={25}/></span></div></Reveal>
      <ul>{['Бриф и согласованный объём работ','Прототип и визуальное направление, если они нужны задаче','Проверка ключевых сценариев и адаптивности веб-интерфейса','Доступы, инструкции и материалы в согласованном объёме'].map(text => <li key={text}>{text}</li>)}</ul>
    </section>
    <ProcessSteps/>
    <LeadSection contacts={contacts}/>
  </main>;
}
