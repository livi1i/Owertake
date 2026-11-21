import {ArrowUpRight,ExternalLink,Globe} from 'lucide-react';
import type {PortfolioProject} from '../lib/portfolio';
import {projectSlug} from '../lib/portfolio';
import {projectUrl} from '../lib/project-url';
import {Reveal} from './reveal';

const homepages:Record<string,string> = {'amoreterno.ru':'/assets/amoreterno-homepage.svg','holodilka60.ru':'/assets/holodilka-homepage.svg'};

export function LiveProject({project,compact=false}:{project:PortfolioProject;compact?:boolean}) {
  const url = projectUrl(project.url);
  if (!url) return null;
  const image = homepages[url.hostname] || project.image;
  const destination = new URL('/',url.origin).href;
  return <article className={'studio-case'+(compact?' studio-case-compact':'')}>
    <a className="studio-case-preview" href={compact ? destination : '/portfolio/'+projectSlug(project)}
      target={compact?'_blank':undefined} rel={compact?'noopener noreferrer':undefined} aria-label={`Посмотреть ${project.title}`}>
      {image ? <img src={image} alt={'Главная страница '+project.title} loading="lazy" decoding="async"/> : <div className="studio-case-fallback"><Globe size={39}/><strong>{project.title}</strong></div>}
      <span className="studio-case-open" aria-hidden="true"><ArrowUpRight size={20}/></span>
    </a>
    {!compact && <div className="studio-case-copy">
      <div className="studio-case-domain"><Globe size={14}/>{url.hostname}</div>
      <h3>{project.title}</h3><p>{project.description}</p>
      <div><a className="secondary-panel" href={'/portfolio/'+projectSlug(project)}><ArrowUpRight size={16}/> Разбор проекта</a>
        <a className="studio-live-link" href={destination} target="_blank" rel="noopener noreferrer" aria-label={'Открыть сайт '+project.title}><ExternalLink size={16}/> Сайт</a>
      </div>
    </div>}
  </article>;
}

export function LiveProjects({projects}:{projects:PortfolioProject[]}) {
  const real = projects.filter(project => project.confirmed === true && projectUrl(project.url));
  if (!real.length) return null;
  return <section className="section studio-work" id="work">
    <Reveal><div className="studio-section-head"><div><h2>Портфолио</h2><p>Действующие сайты, которые разработала наша команда.</p></div>
      <a className="secondary-panel" href="/portfolio"><ArrowUpRight size={18}/> Все работы и примеры</a>
    </div></Reveal>
    <div className="studio-case-list">{real.map((project,index) => <Reveal delay={index*65} key={projectSlug(project)}><LiveProject project={project}/></Reveal>)}</div>
  </section>;
}
