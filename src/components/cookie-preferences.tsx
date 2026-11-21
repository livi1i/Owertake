import React, {useEffect, useRef, useState} from 'react';
import { Cookie, ShieldCheck, X, Check } from 'lucide-react';
import {COOKIE_KEY, necessaryChoice, parseCookieChoice, type CookieChoice} from '../lib/cookie-preferences';
import './cookie-preferences.css';

function readChoice(){try{return parseCookieChoice(localStorage.getItem(COOKIE_KEY));}catch{return null;}}
export function CookiePreferences(){
  const [choice,setChoice]=useState<CookieChoice|null>(readChoice);
  const [open,setOpen]=useState(false);
  const [warning,setWarning]=useState('');
  const [notice,setNotice]=useState('');
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const show=()=>{setWarning('');setOpen(true);};
    const sync=(e:StorageEvent)=>{if(e.key===COOKIE_KEY||e.key===null)setChoice(readChoice());};
    window.addEventListener('overtake:cookie-settings',show);
    window.addEventListener('storage',sync);
    return ()=>{window.removeEventListener('overtake:cookie-settings',show);window.removeEventListener('storage',sync);};
  },[]);
  useEffect(()=>{if(open&&!dialog.current?.open)dialog.current?.showModal();else if(!open&&dialog.current?.open)dialog.current.close();},[open]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return ()=>clearTimeout(timer);},[notice]);
  function save(){
    const next=necessaryChoice();
    try{localStorage.setItem(COOKIE_KEY,JSON.stringify(next));setWarning('');setNotice('Выбор сохранён: только необходимые cookie');}
    catch{setWarning('Браузер не разрешает сохранить выбор. Он действует до перезагрузки страницы.');setNotice('Выбор действует до перезагрузки: хранилище браузера недоступно');}
    setChoice(next);setOpen(false);
  }
  return <>
    {!choice&&!open&&<section className="cookie-banner" aria-labelledby="cookie-banner-title"><div className="cookie-emblem"><Cookie size={23}/></div><div className="cookie-banner-copy"><h2 id="cookie-banner-title">Ваше пространство — ваш выбор</h2><p>Используем только необходимые cookie для входа в кабинет. Аналитика и реклама не подключены.</p><a href="/cookies">Как это работает</a></div><div className="cookie-banner-actions"><button className="btn purple" onClick={save}>Только необходимые <Check size={16}/></button><button className="cookie-settings-link" onClick={()=>setOpen(true)}>Настроить</button></div></section>}
    <dialog className="cookie-dialog" ref={dialog} onCancel={()=>setOpen(false)} onClose={()=>setOpen(false)} aria-labelledby="cookie-settings-title"><button className="cookie-close" onClick={()=>setOpen(false)} aria-label="Закрыть настройки cookie"><X size={20}/></button><span className="cookie-kicker"><ShieldCheck size={17}/> КОНФИДЕНЦИАЛЬНОСТЬ</span><h2 id="cookie-settings-title">Настройки cookie</h2><p>Здесь видно, какие технологии используются на сайте. Выбор можно пересмотреть в любой момент внизу страницы.</p><div className="cookie-category"><div><h3>Необходимые</h3><p>Сессия кабинета, сохранение этого выбора и выбранной вами темы оформления. Без них вход и запоминание настроек не работают.</p></div><span className="cookie-category-state">Всегда активны</span></div><div className="cookie-category"><div><h3>Аналитика</h3><p>Счётчики посещений и сбор статистики не подключены.</p></div><span className="cookie-category-state inactive">Не используются</span></div><div className="cookie-category"><div><h3>Реклама</h3><p>Рекламные трекеры и персонализация рекламы не подключены.</p></div><span className="cookie-category-state inactive">Не используются</span></div><p className="cookie-storage-note">Выбор сохраняется в этом браузере на 180 дней. При появлении новых категорий запросим его снова. Дополнительные технологии этим действием не разрешаются.</p>{choice&&<p className="cookie-storage-note">Последний выбор: {new Date(choice.savedAt).toLocaleDateString('ru-RU')} · только необходимые</p>}{warning&&<p role="alert" className="error">{warning}</p>}<button className="btn purple full" onClick={save}>Сохранить выбор <Check size={17}/></button><a className="cookie-policy-link" href="/cookies">Политика использования cookie →</a></dialog>
    {notice&&<p role="status" className="cookie-notice">{notice}</p>}
  </>;
}
