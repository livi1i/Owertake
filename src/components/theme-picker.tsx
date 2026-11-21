import React, {useEffect, useRef, useState} from 'react';
import {Sun, Moon, Monitor, Check} from 'lucide-react';
import './theme.css';

type Theme = 'light' | 'dark' | 'system';
const key = 'overtake:theme';
const valid = (value: unknown): Theme => value === 'dark' || value === 'light' ? value : 'system';
const choices = [{value:'light',label:'Светлая',Icon:Sun},{value:'dark',label:'Тёмная',Icon:Moon},{value:'system',label:'Как на устройстве',Icon:Monitor}] as const;
function readTheme(): Theme {try{return valid(localStorage.getItem(key));}catch{return 'system';}}
function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark ? '#14121e' : '#f6f6fb');
}

export function ThemePicker() {
  const [theme,setTheme] = useState<Theme>(readTheme);
  const [notice,setNotice] = useState('');
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    applyTheme(theme);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const syncSystem = ()=>{if(theme==='system')applyTheme(theme);};
    media.addEventListener('change',syncSystem);
    return ()=>media.removeEventListener('change',syncSystem);
  },[theme]);
  useEffect(()=>{
    const sync = (event: StorageEvent)=>{if(event.key===key||event.key===null)setTheme(readTheme());};
    const close = (event: PointerEvent)=>{if(!menu.current?.contains(event.target as Node))menu.current?.removeAttribute('open');};
    window.addEventListener('storage',sync);
    document.addEventListener('pointerdown',close);
    return ()=>{window.removeEventListener('storage',sync);document.removeEventListener('pointerdown',close);};
  },[]);
  function choose(value: Theme) {
    setTheme(value);
    try{localStorage.setItem(key,value);setNotice('Тема оформления сохранена');}
    catch{setNotice('Тема действует до перезагрузки: хранилище браузера недоступно');}
    menu.current?.removeAttribute('open');
    menu.current?.querySelector('summary')?.focus();
  }
  const current = choices.find(item=>item.value===theme)!;
  return <div className="theme-control">
    <details className="theme-picker" ref={menu} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();menu.current?.removeAttribute('open');menu.current?.querySelector('summary')?.focus();}}}>
      <summary aria-label={`Тема оформления: ${current.label}`} title="Тема оформления"><span className="theme-symbol" key={theme}><current.Icon size={18}/></span></summary>
      <div className="theme-options" role="group" aria-label="Тема оформления">
        <span>Оформление</span>
        {choices.map(({value,label,Icon})=><button key={value} type="button" aria-label={label} aria-pressed={theme===value} onClick={()=>choose(value)}><Icon size={16}/>{label}{theme===value&&<Check size={15} className="theme-check"/>}</button>)}
      </div>
    </details>
    <span className="theme-status" role="status">{notice}</span>
  </div>;
}
