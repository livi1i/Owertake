import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
let s=await readFile('src/main.tsx','utf8');
s=s.replace('Концепты ниже иллюстрируют','Концепты иллюстрируют').replace('Хорошие<br/>вопросы.','Хорошие <br/>вопросы.');
s=s.replace('<button className="btn purple">Сохранить изменения <Check size={17}/></button></form>',`<button className="btn purple">Сохранить изменения <Check size={17}/></button>{!admin&&<details className="setup-details"><summary>Настройка агентства <ChevronDown size={16}/></summary><p className="muted">Только для основателей. Используйте одноразовый ключ настройки.</p><input id="admin-key" aria-label="Ключ настройки" type="password" autoComplete="off"/><button type="button" className="btn dark" onClick={async()=>{try{await api('admin/claim',{key:(document.getElementById('admin-key') as HTMLInputElement).value});location.reload()}catch(e){notify((e as Error).message)}}}>Активировать кабинет команды</button></details>}</form>`);
await writeFile('src/main.tsx',s);
await mkdir('.local',{recursive:true});
try{await readFile('.local/ADMIN-SETUP.txt')}catch{await writeFile('.local/ADMIN-SETUP.txt',randomBytes(32).toString('hex'))}
