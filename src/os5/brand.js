import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {animate} from 'framer-motion';
import {ArchiveBackground} from '../components/archive-background';
import {Logo} from '../components/logo';
import './workspace-brand.css';

function makeLogo() {
  const node=document.createElement('span');
  node.className='workspace-logo';
  node.translate=false;
  createRoot(node).render(createElement(Logo));
  return node;
}
const logos=[makeLogo(),makeLogo()];

const artwork = document.createElement('div');
artwork.className='workspace-artwork';
artwork.setAttribute('aria-hidden','true');
const artworkRoot = createRoot(artwork);
let background;
let screen;
let controls=[];
const preference='overtake-workspace-motion-paused';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=false;
try { paused=localStorage.getItem(preference)==='1'; } catch {}

function syncMotion() {
  const stopped=paused||reduced.matches||document.hidden;
  document.documentElement.classList.toggle('effects-paused',stopped);
  const button=document.querySelector('[data-action="toggleMotion"]');
  button?.setAttribute('aria-pressed',String(paused||reduced.matches));
  if (button) {
    button.disabled=reduced.matches;
    button.querySelector('span').textContent=reduced.matches?'Анимации отключены системой':paused?'Возобновить анимации':'Приостановить анимации';
  }
  if (stopped) {
    for (const animation of controls) animation.complete();
    controls=[];
  }
}
reduced.addEventListener('change',syncMotion);
document.addEventListener('visibilitychange',syncMotion);
export function toggleMotion() {
  paused=!paused;
  try {localStorage.setItem(preference,paused?'1':'0');} catch {}
  syncMotion();
}

export function refreshBrand(page, theme) {
  document.querySelectorAll('[data-workspace-logo]').forEach((slot,index)=>slot.replaceChildren(logos[index]));
  const surface=document.querySelector('[data-workspace-background]');
  if (surface) {
    const variant=surface.dataset.workspaceBackground;
    if (background!==variant) {
      background=variant;
      artworkRoot.render(createElement(ArchiveBackground,{variant}));
    }
    surface.prepend(artwork);
  }
  document.documentElement.style.colorScheme=theme==='dark'?'dark':'light';
  document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#021b3e':'#e7edf7';
  syncMotion();
  if (screen===page) return;
  screen=page;
  playEntrance(document.querySelector('[data-workspace-intro]'),0.34,9);
}

export function playEntrance(node,duration=0.2,offset=6) {
  if (!node||paused||reduced.matches||document.hidden) return;
  const animation=animate(node,{opacity:[0.8,1],transform:['translateY('+offset+'px)','translateY(0)']},
    {duration,ease:[0.22,1,0.36,1]});
  controls.push(animation);
  animation.then(()=>{controls=controls.filter(item=>item!==animation);});
}
