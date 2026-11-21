import {ArrowLeft,ArrowUpRight,FileText,Headphones,Layers,Workflow} from 'lucide-react';

const principles = [
  {Icon:Layers, title:'Одна команда на весь проект', text:'Помогаем собрать требования, проектируем интерфейс, разрабатываем и запускаем продукт.'},
  {Icon:FileText, title:'Работа по договору', text:'До старта согласуем объём, бюджет, сроки, порядок правок и передачу результата.'},
  {Icon:Workflow, title:'Связь с вашей системой', text:'Учитываем, как команда уже принимает заявки, ведёт клиентов и пользуется данными.'},
  {Icon:Headphones, title:'Поддержка после запуска', text:'Передаём доступы и инструкции. При необходимости берём обновления и доработки на сопровождение.'},
];

export function AboutPage() {
  return <main id="main" className="catalog-page about-page">
    <a className="catalog-back" href="/"><ArrowLeft size={17}/> На главную</a>
    <div className="catalog-heading">
      <div><h1>О компании</h1><p>OVERTAKE — независимое цифровое агентство из Пскова.</p></div>
      <p>Два основателя ведут проекты от первой встречи до запуска. Создаём сайты, Telegram-ботов и приложения, внедряем CRM и автоматизируем работу команды.</p>
    </div>
    <section className="catalog-panel">
      <h2>Как мы ведём проекты</h2>
      <div className="about-principles">
        {principles.map(({Icon,title,text}) => <article key={title} className="soft-service-card">
          <span className="soft-service-icon"><Icon size={23}/></span><h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>
    <div className="catalog-bottom"><div><h2>Обсудим ваш проект</h2><p>Онлайн или лично по предварительной договорённости.</p></div><a className="btn purple" href="/contacts">Связаться с нами <ArrowUpRight size={17}/></a></div>
  </main>;
}
