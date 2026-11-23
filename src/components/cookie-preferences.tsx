import {useEffect,useState} from 'react';
import {Cookie} from 'lucide-react';
import {COOKIE_ACCEPTED_EVENT,COOKIE_KEY,necessaryChoice,parseCookieChoice,type CookieChoice} from '../lib/cookie-preferences';
import './cookie-preferences.css';

function readChoice() {
  try { return parseCookieChoice(localStorage.getItem(COOKIE_KEY)); } catch { return null; }
}

export function CookiePreferences() {
  const [choice,setChoice] = useState<CookieChoice | null>(readChoice);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === COOKIE_KEY || event.key === null) setChoice(readChoice());
    };
    window.addEventListener('storage',sync);
    return () => window.removeEventListener('storage',sync);
  },[]);

  function accept() {
    const next = necessaryChoice();
    try { localStorage.setItem(COOKIE_KEY,JSON.stringify(next)); } catch {}
    setChoice(next);
    window.dispatchEvent(new Event(COOKIE_ACCEPTED_EVENT));
  }

  if (choice) return null;
  return <aside className="cookie-banner small-notice" aria-label="Файлы cookie">
    <span className="small-notice-icon" aria-hidden="true"><Cookie size={17}/></span>
    <p>Используем <a href="/cookies">необходимые cookie</a> для работы сайта.</p>
    <button className="notice-accept" type="button" onClick={accept}>Согласиться</button>
  </aside>;
}
