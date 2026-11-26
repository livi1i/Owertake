# Работа над актуальным OVERTAKE

Источник: https://github.com/livi1i/Owertake, ветка master. Она объединяет готовую главную и CRM OS 5.0, размещённые на Timeweb. История Git и старые ветки не являются пакетами публикации.

Установить Node.js 24+. Скачать: git clone --branch master https://github.com/livi1i/Owertake.git. В папке проекта выполнить npm ci и npm run dev:os5. Открыть http://127.0.0.1:5178/ и /cabinet. Локальная .local/overtake-os5-preview.sqlite создаётся отдельно; рабочие аккаунты не передаются через Git.

Перед работой: git pull --ff-only. Разрабатывать в своей ветке от свежей master; перед объединением выполнить npm test, npm run build, проверить десктоп, мобильный экран, анимации и reduced motion. Внутренние страницы и серверные функции нужны следующему этапу — их нельзя удалять только потому, что их дизайн старее главной.

Дизайн: DESIGN-HANDOFF.md, design-system/overtake/OVERTAKE-DESIGN.md, .agents/skills/. Текст для GPT партнёра: docs/PARTNER-GPT-PROMPT.md. Главную без отдельной задачи не менять.

Публикация только по TIMEWEB.md. Не загружать весь репозиторий, старые установочные ZIP, .local, SQLite или секреты в public_html. Пуш в GitHub сам по себе Timeweb не обновляет.
