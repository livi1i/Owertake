export type ProjectOptions={volume:number;complexity:string;urgency:string;features:string[]};
export const complexities=['Стандартная','Повышенная','Нужна консультация'];
export const urgencies=['Обычный график','Ускоренный запуск','Срок пока не определён'];
export function projectSchema(category:string){
 const schemas:Record<string,{unit:string;hint:string;features:string[]}>= {
  'Сайты':{unit:'Страницы / типы страниц',hint:'Для магазина считайте уникальные шаблоны, а не товары.',features:['Каталог и фильтры','Корзина и заказ','Онлайн-оплата','Личный кабинет','Интеграция с CRM','Многоязычность','Анимация']},
  'Боты и автоматизация':{unit:'Рабочие сценарии',hint:'Например: принять заявку, записать клиента, отправить отчёт.',features:['Приём заявок','Запись и бронирование','Уведомления','Оплата','Панель управления','Интеграция с CRM','Обмен с 1С']},
  'ИИ':{unit:'Задачи ассистента',hint:'Например: ответы по базе знаний и обработка документов — две задачи.',features:['База знаний','Поиск по документам','Работа с файлами','Подключение CRM','Telegram-интерфейс','Передача диалога сотруднику','Контроль качества ответов']},
  'Дизайн':{unit:'Экраны / материалы',hint:'Укажите ориентир. Точный перечень согласуем после обсуждения.',features:['Исследование','Прототип','Дизайн-система','Адаптация для смартфона','Логотип','Брендбук','Шаблоны материалов']},
  'Продвижение':{unit:'Площадки / направления',hint:'Например: социальная сеть, поисковая реклама и локальные карты.',features:['Аудит','Контент-план','Оформление','SEO-подготовка','Настройка рекламы','Веб-аналитика','Отчётность']},
  'Видео и 3D':{unit:'Ролики / сцены',hint:'Длительность и форматы уточним при подготовке сметы.',features:['Сценарий','Раскадровка','Монтаж','3D-графика','Анимация','Звук и титры','Адаптация форматов']},
  'Приложения':{unit:'Экраны / рабочие модули',hint:'Например: профиль, заказы и отчёты. Это предварительный ориентир.',features:['Авторизация и роли','Личный кабинет','Админ-панель','Платежи','Интеграции API','Уведомления','Отчёты','Офлайн-режим']},
  'Сопровождение':{unit:'Задачи / компоненты',hint:'Перечислите известные задачи; регулярность обсудим отдельно.',features:['Диагностика','Исправление ошибок','Обновления','Резервные копии','Мониторинг','Оптимизация скорости','Перенос проекта']},
 };
 return schemas[category]||{unit:'Задачи',hint:'Объём уточним после обсуждения.',features:['Разбор задачи','Проектирование','Интеграции','Поддержка']};
}
export function normalizeProject(category:string,input:ProjectOptions):ProjectOptions{
 const allowed=projectSchema(category).features;
 return {volume:Number.isFinite(input.volume)?Math.min(100,Math.max(1,Math.round(input.volume))):1,complexity:complexities.includes(input.complexity)?input.complexity:complexities[0],urgency:urgencies.includes(input.urgency)?input.urgency:urgencies[0],features:[...new Set(input.features.filter(x=>allowed.includes(x)))]};
}
export function projectSummary(service:{name:string;category:string},input:ProjectOptions){const p=normalizeProject(service.category,input);return ['СОСТАВ ПРОЕКТА OVERTAKE',`Услуга: ${service.name}`,`Направление: ${service.category}`,`${projectSchema(service.category).unit}: ${p.volume}`,`Сложность: ${p.complexity}`,`Сроки: ${p.urgency}`,`Функции: ${p.features.length?p.features.join('; '):'требуют обсуждения'}`,'Стоимость: индивидуальная оценка. Тарифы пока не опубликованы.','Это предварительный состав проекта, а не смета или договор.'].join('\n');}
