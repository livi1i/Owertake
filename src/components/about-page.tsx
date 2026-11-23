/// <reference types="vite/client" />
import {ArrowLeft,AppWindow,Bot,Code2,FileText,Headphones,Layers,Server,Sparkles,Workflow} from 'lucide-react';
import {Reveal} from './reveal';
import {ProcessSteps} from './process-steps';
import {LeadSection} from './lead-section';
import {PartnershipArt} from './partnership-art';

const principles = [
  {Icon:Layers,title:'От сайта до CRM',text:'Дизайн, разработка и продвижение работают на одну задачу. Связываем продукт с тем, чем команда уже пользуется.'},
  {Icon:FileText,title:'Прозрачная цена',text:'Указываем точные цены на работы с описанным объёмом. Нестандартные задачи оцениваем после обсуждения. Работы, оплату и правки фиксируем в договоре.'},
  {Icon:Server,title:'Хостинг под проект',text:'Подбираем инфраструктуру, настраиваем домен и размещаем продукт. Согласуем, у кого будут доступы.'},
  {Icon:Headphones,title:'Поддержка и развитие',text:'После запуска можем обновлять, исправлять ошибки и развивать новые функции по согласованному плану.'},
];

const capabilities = [
  {Icon:AppWindow,title:'Сайты и веб-приложения',text:'Лендинги, корпоративные сайты, магазины и личные кабинеты. Проектируем и простую страницу, и сервис с ролями, данными и интеграциями.'},
  {Icon:Bot,title:'Telegram-боты и Mini Apps',text:'Запись, каталоги, оплата, уведомления и внутренние инструменты прямо в Telegram.'},
  {Icon:Workflow,title:'CRM и автоматизация',text:'Настраиваем готовые CRM, разрабатываем собственные, связываем формы, 1С, оплату и другие системы.'},
  {Icon:Sparkles,title:'Дизайн и AI',text:'Разрабатываем айдентику и интерфейсы, внедряем AI-ассистентов для работы с заявками, текстами и документами.'},
];

export function AboutPage({contacts}:{contacts:Record<string,string>}) {
  return <main id="main" className="catalog-page about-page">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <header className="page-banner" data-enter>
      <div><h1>Два основателя.<br/>Одна команда.</h1><p>OVERTAKE — цифровое агентство из Пскова. Создаём цифровые продукты под задачи бизнеса. От точечной доработки до системы с несколькими интерфейсами и интеграциями.</p><a className="secondary-panel" href="#request">Обсудить проект</a></div>
      <PartnershipArt compact/>
    </header>
    <section className="studio-inner-section">
      <Reveal><div className="studio-section-head"><h2>Почему OVERTAKE</h2><p>Вы обсуждаете задачу с людьми, которые ведут проект.</p></div></Reveal>
      <div className="about-principles">
        {principles.map(({Icon,title,text},index) => <Reveal key={title} delay={index*55}><article className="studio-service-card"><span className="studio-glyph"><Icon size={24}/></span><h3>{title}</h3><p>{text}</p></article></Reveal>)}
      </div>
    </section>
    <section className="studio-inner-section about-capabilities">
      <Reveal><div className="studio-section-head"><h2>Что мы создаём</h2><a className="secondary-panel" href="/services">Продукты и решения</a></div></Reveal>
      <div>{capabilities.map(({Icon,title,text},index)=><Reveal key={title} delay={index*70}>
        <article><span className="studio-glyph"><Icon size={24}/></span><h3>{title}</h3><p>{text}</p></article>
      </Reveal>)}</div>
      <Reveal><p>Если задача выходит за рамки готового пакета, разберём ваш процесс, предложим архитектуру, состав работ и последовательность запуска.</p></Reveal>
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
