import {database} from './local-db.mjs';
const email=process.argv[2];if(!email){console.error('Usage: node scripts/admin.mjs registered@example.com');process.exit(1)}
const db=database('.local/overtake.sqlite');const r=db.sqlite.prepare("UPDATE users SET role='admin' WHERE email=?").run(email.toLowerCase());console.log(r.changes?'Локальный администратор назначен':'Сначала зарегистрируйте этот аккаунт на локальном сайте');db.sqlite.close();
