import {Globe,Send} from 'lucide-react';
import type {PortfolioProject} from '../lib/portfolio';
import {projectSlug} from '../lib/portfolio';
import {projectUrl} from '../lib/project-url';
import {Reveal} from './reveal';
import {getBotScreens} from './bot-case-media';

export const casePreviews:Record<string,string> = {'amoreterno.ru':'/assets/amoreterno-homepage.svg','holodilka60.ru':'/assets/holodilka-homepage.svg'};

export function ProjectSiteLink({project,full=false}:{project:PortfolioProject;full?:boolean}) {
  const url=projectUrl(project.url);
  if (!url) return null;
  const telegram=url.hostname==='t.me';
  const label=telegram?'Открыть в Telegram':'Открыть сайт';
  return <a className="studio-live-link" href={telegram?url.href:url.origin+'/'} target="_blank" rel="noopener noreferrer"
    aria-label={label+' · '+project.title}><span className="studio-live-link-icon" aria-hidden="true">{telegram?<Send size={16}/>:<Globe size={16}/>}</span>
    {telegram?(full?label:'Telegram'):(full?label:'Сайт')}</a>;
}

export function LiveProject({project,compact=false}:{project:PortfolioProject;compact?:boolean}) {
  const url = projectUrl(project.url);
  if (!url) return null;
  const screens=getBotScreens(url);
  const image = casePreviews[url.hostname] || project.image;
  const destination = new URL('/',url.origin).href;
  return <article className={'studio-case'+(compact?' studio-case-compact':'')}>
    <a className={'studio-case-preview'+(screens?' studio-case-preview-bot':'')} href={compact ? (screens?url.href:destination) : '/portfolio/'+projectSlug(project)}
      target={compact?'_blank':undefined} rel={compact?'noopener noreferrer':undefined} aria-label={`Посмотреть ${project.title}`}>
      {screens ? <div className="bot-screen-pair">{screens.map(({src,alt})=><img key={alt} src={src} alt={alt} loading="lazy" decoding="async"/>)}</div> :
        image ? <img src={image} alt={'Главная страница '+project.title} loading="lazy" decoding="async"/> : <div className="studio-case-fallback"><Globe size={39}/><strong>{project.title}</strong></div>}
      </a>
    {!compact && <div className="studio-case-copy">
      <div className="studio-case-domain">{screens?<Send size={14}/>:<Globe size={14}/>} {screens?'@'+url.pathname.slice(1):url.hostname}</div>
      <h3>{project.title}</h3><p>{project.description}</p>
      <div><a className="secondary-panel" href={'/portfolio/'+projectSlug(project)}>Разбор проекта</a>
        <ProjectSiteLink project={project}/>
      </div>
    </div>}
  </article>;
}

export function LiveProjects({projects}:{projects:PortfolioProject[]}) {
  const real = projects.filter(project => project.confirmed === true && projectUrl(project.url));
  if (!real.length) return null;
  return <section className="section studio-work" id="work">
    <Reveal><div className="studio-section-head"><div><h2>Портфолио</h2><p>Действующие сайты и мини-приложения нашей команды.</p></div>
      <a className="secondary-panel" href="/portfolio">Все работы и примеры</a>
    </div></Reveal>
    <div className="studio-case-list">{real.map((project,index) => <Reveal delay={index*65} key={projectSlug(project)}><LiveProject project={project}/></Reveal>)}</div>
  </section>;
}
