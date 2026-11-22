import {useEffect,useState} from 'react';
import {ArrowLeft,Check,Layers} from 'lucide-react';
import {portfolioItems,filterPortfolio,projectSlug,type PortfolioProject} from '../lib/portfolio';
import {ConceptVisual} from './concept-visual';
import {LiveProject,casePreviews} from './live-projects';
import {projectUrl} from '../lib/project-url';
import {LeadSection} from './lead-section';
import {Reveal} from './reveal';
import {CaseReview} from './case-review';
import './portfolio-page.css';

function Preview({project}:{project:PortfolioProject}) {
  if (project.image) return <img className="case-preview" src={project.image} alt={'Интерфейс '+project.title} loading="lazy"/>;
  return <div className={'case-preview case-preview-'+(project.visual??0)}>{project.concept ? <ConceptVisual project={project}/> : <Layers size={42}/>}</div>;
}

export function PortfolioPage({contacts}:{contacts:Record<string,string>}) {
  const [items,setItems] = useState<PortfolioProject[]>([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);
  const [category,setCategory] = useState('Все');
  const slug = location.pathname.split('/')[2];
  const project = items.find(item => projectSlug(item) === slug);
  const real = items.filter(item => !item.concept);
  const filtered = filterPortfolio(real,'',category,'Клиентские проекты');
  const categories = [...new Set(real.map(item => item.category))];

  function load() {
    setLoading(true);
    setError('');
    fetch('/api/content').then(async response => {
      if (!response.ok) throw Error('Не удалось загрузить проекты');
      return response.json();
    }).then(data => setItems(portfolioItems(data.projects))).catch(error => setError(error.message)).finally(() => setLoading(false));
  }
  useEffect(load,[]);

  return <main className="portfolio-page" id="main">
    <a className="catalog-back" href={slug?'/portfolio':'/'}><ArrowLeft size={17}/>{slug?'Все проекты':'На главную'}</a>
    {loading ? <p role="status">Загружаем портфолио…</p> : error ? <div role="alert" className="case-empty"><p>{error}</p><button className="btn purple" onClick={load}>Повторить</button></div> :
      slug ? project ? <>
        <header className="page-banner case-review-header" data-enter><div>
          <span className="case-label">{project.concept?'Дизайн-концепция':project.category}</span>
          <h1>{project.title}</h1><p>{project.description}</p>
          {!project.concept && project.url && <a className="secondary-panel" href={project.url} target="_blank" rel="noopener noreferrer">Открыть сайт</a>}
        </div>{!project.concept && project.url ? <LiveProject project={project} compact/> : <Preview project={project}/>}</header>
        {!project.concept && <CaseReview url={project.url}/>}
        {(project.task||project.result||project.technologies) && <div className="case-review-notes">
          {project.task && <section><h2>Задача</h2><p>{project.task}</p></section>}
          {project.result && <section><h2>Что получилось</h2><p>{project.result}</p></section>}
          {project.technologies && <section><h2>Технологии</h2><div className="case-technologies">{project.technologies.split(',').map(item => <span key={item}><Check size={14}/>{item.trim()}</span>)}</div></section>}
        </div>}
        {!project.concept && <LeadSection contacts={contacts} heading="Есть похожая задача?"/>}
      </> : <div className="case-empty"><h1>Проект не найден</h1><a className="secondary-panel" href="/portfolio">Открыть портфолио</a></div> :
      <>
        <header className="page-banner portfolio-heading" data-enter><div><h1>Портфолио</h1><p>Откройте кейс, чтобы увидеть задачу клиента, ход работы и готовый сайт.</p><a href="#portfolio-cases" className="secondary-panel">Смотреть кейсы</a></div><div className="portfolio-collage" aria-hidden="true">
          {real.map(item => {const url=projectUrl(item.url);return url ? casePreviews[url.hostname] || item.image : item.image;}).filter(Boolean).slice(0,2).map((src,index) =>
            <img src={src} alt="" key={index} width={466} height={262} />)}
        </div></header>
        <div className="catalog-filters" id="portfolio-cases" aria-label="Категории портфолио">{['Все',...categories].map(item => <button key={item} type="button" aria-pressed={category===item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {filtered.length ? <div className="studio-case-list">{filtered.map((item,index) => <Reveal className="portfolio-case-reveal" key={projectSlug(item)} delay={Math.min(index,3)*110}>
          {item.url ? <LiveProject project={item}/> : <a className="case-card" href={'/portfolio/'+projectSlug(item)}><Preview project={item}/><div className="case-card-copy"><h2>{item.title}</h2><p>{item.description}</p></div></a>}
        </Reveal>)}</div> : <div className="case-empty"><p>В этой категории пока нет опубликованных проектов.</p></div>}
        <LeadSection contacts={contacts} heading="Обсудим похожий проект"/>
      </>}
  </main>;
}
