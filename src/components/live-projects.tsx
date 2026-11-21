import React from 'react';
import {ArrowUpRight,Globe,ExternalLink} from 'lucide-react';
import type {PortfolioProject} from '../lib/portfolio';
import {projectSlug} from '../lib/portfolio';
import {projectUrl} from '../lib/project-url';
import './live-projects.css';
const homepages:Record<string,string>={'amoreterno.ru':'/assets/amoreterno-homepage.svg','holodilka60.ru':'/assets/holodilka-homepage.svg'};
export function LiveProject({project,compact=false}:{project:PortfolioProject;compact?:boolean}){
 const url=projectUrl(project.url);if(!url)return null;
 const image=homepages[url.hostname]||project.image,destination=new URL('/',url.origin).href;
 return <article className={'live-project'+(compact?' live-project-compact':'')}>
  <div className="live-project-toolbar"><span><i/><i/><i/></span><span><Globe size={11}/>{url.hostname}</span><a href={destination} target="_blank" rel="noopener noreferrer" aria-label={'Открыть '+project.title+' в новой вкладке'}><ArrowUpRight size={16}/></a></div>
  <a className="live-project-screen live-project-preview" href={destination} target="_blank" rel="noopener noreferrer" aria-label={'Посмотреть оригинальный сайт '+project.title}>
   {image?<img src={image} alt={'Главная страница сайта '+project.title} loading="lazy" decoding="async"/>:<div className="live-project-cover"><strong>{project.title}</strong><p>{project.description}</p></div>}
   <span className="live-project-visit">Посмотреть сайт <ArrowUpRight size={19}/></span>
  </a>
  <div className="live-project-copy"><div><span>РЕАЛЬНЫЙ ПРОЕКТ</span><h3>{project.title}</h3><p>{project.description}</p></div><a className="live-project-open" href={destination} target="_blank" rel="noopener noreferrer">Открыть сайт <ExternalLink size={15}/></a></div>
  {homepages[url.hostname]&&<p className="live-project-note">Главная страница · снимок от 17.11.2026 · сайт откроется в новой вкладке</p>}
 </article>;
}
export function LiveProjects({projects}:{projects:PortfolioProject[]}){const real=projects.filter(p=>p.confirmed===true&&projectUrl(p.url));if(!real.length)return null;return <section className="section live-projects-section" id="work"><div className="live-projects-heading"><div><h2>Портфолио</h2></div><p>Действующие сайты, которые разработала наша команда.</p></div><div className="live-projects-grid">{real.map(p=><div className="case-real-project" key={projectSlug(p)}><LiveProject project={p}/><a className="case-real-details" href={'/portfolio/'+projectSlug(p)}>Разбор проекта <ArrowUpRight size={16}/></a></div>)}</div><a className="secondary-panel" href="/portfolio">Все работы и примеры <ArrowUpRight size={17}/></a></section>}
