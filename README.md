# OVERTAKE — актуальный сайт и CRM OS 5.0

Основная версия — **master**. Готовая главная и CRM объединены. Сайт: https://helmerzy.tw1.ru/. Опубликованная базовая сборка: 6ade4c5a7817e579 от 26.11.2026. Последующие изменения публикуются отдельно.

Для запуска нужен Node.js 24+:

~~~sh
git clone --branch master https://github.com/livi1i/Owertake.git
cd Owertake
npm ci
npm run dev:os5
~~~

Сайт: http://127.0.0.1:5178/, CRM: /cabinet. React 19, TypeScript, Vite, **Framer Motion 12.43.0**. Включены фоны, иллюстрации, локальные шрифты, три скилла и адаптированный дизайн MD. Локальная база отдельная; production-данные в Git не входят.

- [TEAM.md](TEAM.md) — совместная работа.
- [DESIGN-HANDOFF.md](DESIGN-HANDOFF.md) — карта дизайна, фонов и CRM.
- [OVERTAKE-DESIGN.md](design-system/overtake/OVERTAKE-DESIGN.md) — палитра.
- [Текст для GPT партнёра](docs/PARTNER-GPT-PROMPT.md).
- [TIMEWEB.md](TIMEWEB.md) — публикация приложения с сохранением данных.
- [Проверка опубликованной версии](docs/TIMEWEB-DEPLOY-2026-11-26.md).

Проверки: npm test, npm run build. Подготовка обновления: npm run release:timeweb — ничего на хостинге не меняет. Нельзя заливать весь репозиторий в public_html или заменять серверную SQLite локальной.

Референсы design/reference/ — материалы дизайна, не второй сайт и не файлы публикации. Прежние варианты доступны в истории Git; неиспользуемые пробные изображения убраны из текущих исходников. Действующие внутренние страницы сохранены для переработки.

Ограничения CRM: qa/OVERTAKE_OS5_REPORT.md. Наличие экранов не означает подключение почты, оплаты, подписи или TOTP.
