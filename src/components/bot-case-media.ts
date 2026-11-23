/// <reference types="vite/client" />
import wheel from '../assets/portfolio-randweelore-live.webp?inline';
import wheelResult from '../assets/portfolio-randweelore-result.webp?inline';
import xploreAction from '../assets/portfolio-xplore-action.webp?inline';
import xploreDirection from '../assets/portfolio-xplore-direction.webp?inline';

const botScreens:Record<string,{src:string;alt:string}[]> = {
  '/randweelore_bot': [
    {src:wheel,alt:'Крутика в браузере: колесо с вариантами'},
    {src:wheelResult,alt:'Крутика: результат вращения и кнопка отправки'},
  ],
  '/xplore_app_bot': [
    {src:xploreAction,alt:'XPLORE в Telegram: форма нового действия'},
    {src:xploreDirection,alt:'XPLORE в Telegram: экран создания направления'},
  ],
};

export function getBotScreens(url:URL|null) {
  return url?.hostname==='t.me'?botScreens[url.pathname.replace(/\/$/,'')]:undefined;
}
