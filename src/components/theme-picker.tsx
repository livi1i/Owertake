import {useEffect,useState} from 'react';
import {Sun,Moon} from 'lucide-react';
import './theme.css';

type Theme = 'light' | 'dark';
const key = 'overtake:theme';
function readTheme():Theme {
  try { return localStorage.getItem(key)==='dark'?'dark':'light'; } catch { return 'light'; }
}

export function ThemePicker() {
  const [theme,setTheme] = useState<Theme>(readTheme);
  const dark = theme==='dark';
  const next = dark?'light':'dark';
  useEffect(() => {
    document.documentElement.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#0c1526':'#eff6ff');
  },[theme,dark]);
  useEffect(() => {
    function sync(event:StorageEvent) { if (event.key===key || event.key===null) setTheme(readTheme()); }
    window.addEventListener('storage',sync);
    return () => window.removeEventListener('storage',sync);
  },[]);
  return <button className="theme-switch" type="button" aria-label="Тёмная тема" aria-pressed={dark}
    title={dark?'Включить светлую тему':'Включить тёмную тему'} onClick={() => {
      setTheme(next);
      try { localStorage.setItem(key,next); } catch {}
    }}><span className="theme-symbol" key={theme}>{dark?<Moon size={18}/>:<Sun size={18}/>}</span></button>;
}
