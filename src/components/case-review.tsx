import {CalendarDays,FileCheck2,LayoutGrid,MailCheck,MapPinned,PackageCheck,Search,SlidersHorizontal} from 'lucide-react';
import {projectUrl} from '../lib/project-url';
import {Reveal} from './reveal';

const reviews = {
  'amoreterno.ru': {
    goal:'Показать, чем персональное свадебное приглашение отличается от обычной открытки, и помочь паре представить, как гости будут им пользоваться.',
    path:['Посмотреть коллекцию','Открыть пример приглашения','Обсудить свой дизайн'],
    features:[
      {Icon:LayoutGrid,title:'Коллекция и примеры',text:'Работы собраны в галерею. Можно выбрать настроение, открыть пример и оценить оформление целиком.'},
      {Icon:CalendarDays,title:'Программа дня',text:'Пример приглашения показывает, как собрать дату, таймер, расписание и дресс-код в одной последовательности.'},
      {Icon:MapPinned,title:'Маршрут для гостей',text:'Адрес и карта размещаются рядом с программой. Гость получает всю информацию о месте встречи по одной ссылке.'},
      {Icon:MailCheck,title:'Ответы и приватность',text:'На сайте показаны сценарии подтверждения участия и приватного доступа для приглашённых.'},
    ],
  },
  'holodilka60.ru': {
    goal:'Помочь покупателю быстро найти конкретную запчасть или подобрать совместимый аналог, а клиенту с задачей по сервису дать прямой путь к обращению.',
    path:['Найти по названию или коду 1С','Сверить карточку товара','Уточнить наличие или подбор'],
    features:[
      {Icon:Search,title:'Поиск по товару и коду 1С',text:'Поиск вынесен на первый экран каталога. Можно начать с названия, артикула или кода из учётной системы.'},
      {Icon:LayoutGrid,title:'Структура каталога',text:'Оборудование и комплектующие разнесены по направлениям. Карточки раскрывают сведения о конкретном товаре.'},
      {Icon:PackageCheck,title:'Снова в наличии',text:'Вернувшиеся позиции собраны отдельно, чтобы их можно было заметить без повторного обхода всего каталога.'},
      {Icon:SlidersHorizontal,title:'Подбор и сервис',text:'Есть отдельный сценарий для замены и совместимости, а услуги для бизнеса вынесены в самостоятельный раздел.'},
    ],
  },
};

export function CaseReview({url}:{url?:string}) {
  const host=projectUrl(url)?.hostname;
  const review=reviews[host as keyof typeof reviews];
  if (!review) return null;
  return <div className="case-review">
    <Reveal><section className="case-review-goal"><span className="studio-glyph"><FileCheck2 size={22}/></span><div><h2>Задача проекта</h2><p>{review.goal}</p></div></section></Reveal>
    <section aria-label="Что проработано">
      <h2>Что проработано</h2>
      <div className="case-review-features">{review.features.map(({Icon,title,text},index)=><Reveal key={title} delay={index*100}>
        <article><span className="studio-glyph"><Icon size={23}/></span><h3>{title}</h3><p>{text}</p></article>
      </Reveal>)}</div>
    </section>
    <Reveal><section className="case-review-path"><h2>Путь посетителя</h2><ol>{review.path.map((step,index)=><li key={step}><b>{index+1}</b>{step}</li>)}</ol></section></Reveal>
  </div>;
}
