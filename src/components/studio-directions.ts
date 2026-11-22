import {AppWindow,Bot,ChartNoAxesCombined,Clapperboard,Globe,Headphones,Kanban,Paintbrush,Server,Sparkles} from 'lucide-react';

export const directions = [
  {category:'Сайты',name:'Разработка сайтов',text:'Лендинги, сайты компаний и магазины.',Icon:Globe,slug:'landing'},
  {category:'Боты и автоматизация',name:'Боты и автоматизация',text:'Заявки, запись и продажи в Telegram.',Icon:Bot,slug:'telegram'},
  {category:'CRM',name:'CRM-системы',text:'Внедрение CRM и учёт под ваши процессы.',Icon:Kanban,slug:'crm-setup'},
  {category:'ИИ',name:'ИИ-решения',text:'Ассистенты, документы и обработка заявок.',Icon:Sparkles,slug:'ai-assistants'},
  {category:'Дизайн',name:'Дизайн',text:'Интерфейсы, логотипы и фирменный стиль.',Icon:Paintbrush,slug:'ui-ux'},
  {category:'Продвижение',name:'Продвижение',text:'SEO, реклама и ведение соцсетей.',Icon:ChartNoAxesCombined,slug:'seo'},
  {category:'Приложения',name:'Приложения',text:'Личные кабинеты, платформы и PWA.',Icon:AppWindow,slug:'web-apps'},
  {category:'Сопровождение',name:'Поддержка',text:'Диагностика, обновления и доработки.',Icon:Headphones,slug:'support'},
  {category:'Хостинг и домены',name:'Хостинг и домены',text:'Размещение, регистрация и продление.',Icon:Server,slug:'hosting'},
  {category:'Видео и 3D',name:'Видео и 3D',text:'Монтаж, объёмная графика и анимация.',Icon:Clapperboard,slug:'video'},
];
