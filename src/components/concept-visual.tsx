import React from 'react';
import {ServicePreview} from './service-preview';
import {ProjectVisual} from './project-visual';
import type {PortfolioProject} from '../lib/portfolio';
import './work-gallery.css';
export function ConceptVisual({project}:{project:PortfolioProject}){return project.visual!==undefined?<ProjectVisual index={project.visual}/>:<div className="concept-art"><div className="concept-art-header"><span>● ● ●</span><span>{project.title}</span><span>↗</span></div><ServicePreview slug={project.serviceSlug||''}/><span className="concept-art-label">АВТОРСКИЙ ПРИМЕР РЕШЕНИЯ</span></div>}
