import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {activationScript} from '../scripts/timeweb-panel.mjs';

const php=process.env.PHP_BINARY||(existsSync('.local/php/php.exe')?resolve('.local/php/php.exe'):'php');
const args=existsSync('.local/php/ext/php_pdo_sqlite.dll')?['-d','extension_dir='+resolve('.local/php/ext'),'-d','extension=pdo_sqlite']:[];
const available=spawnSync(php,[...args,'-r',"exit(extension_loaded('pdo_sqlite')?0:1);"]).status===0;
const old='aaaaaaaaaaaaaaaa',id='bbbbbbbbbbbbbbbb';
const router='<?php echo "router";';

test('Timeweb update preserves database/config and refuses stale, tampered or unsafe releases',{skip:!available},async()=>{
  for(const scenario of ['valid','stale','tampered','unsafe']){
    const dir=await mkdtemp(join(tmpdir(),'overtake-deploy-'));
    try{
      const privateDir=join(dir,'overtake-private');
      await mkdir(join(privateDir,'releases'),{recursive:true});await mkdir(join(dir,'public_html'));
      await writeFile(join(privateDir,'current'),scenario==='stale'?'cccccccccccccccc':old);
      await writeFile(join(privateDir,'config.json'),'{"existing":"unchanged"}');
      await writeFile(join(privateDir,'schema.sql'),'existing schema');
      await writeFile(join(dir,'public_html/index.php'),'old router');
      let init=spawnSync(php,[...args,'-r',`$d=new PDO('sqlite:'.getcwd().'/overtake-private/data.sqlite');$d->exec("CREATE TABLE records(value TEXT); INSERT INTO records VALUES ('preserve me')");`],{cwd:dir});assert.equal(init.status,0,init.stderr?.toString());
      const files={'api.php':'<?php echo "api";','client/index.html':'<main>new</main>','client/assets/background.png':'image bytes'};
      if(scenario==='unsafe')files['../config.json']='bad';
      const raw=JSON.stringify(Object.fromEntries(Object.entries(files).map(([p,v])=>[p,Buffer.from(v).toString('base64')])));
      const hash=createHash('sha256').update(raw).digest('hex');
      await writeFile(join(dir,`overtake-release-${id}.json`),raw+(scenario==='tampered'?' ':''));
      await writeFile(join(dir,'activate.php'),activationScript({id,hash,expected:old,router}));
      const result=spawnSync(php,[...args,join(dir,'activate.php')],{cwd:dir,encoding:'utf8'});
      assert.equal(result.status===0,scenario==='valid',result.stdout+result.stderr);
      assert.equal(await readFile(join(privateDir,'current'),'utf8'),scenario==='valid'?id:scenario==='stale'?'cccccccccccccccc':old);
      assert.equal(await readFile(join(privateDir,'config.json'),'utf8'),'{"existing":"unchanged"}');
      assert.equal(await readFile(join(privateDir,'schema.sql'),'utf8'),'existing schema');
      const rows=spawnSync(php,[...args,'-r',`$d=new PDO('sqlite:'.getcwd().'/overtake-private/data.sqlite');echo $d->query('SELECT value FROM records')->fetchColumn();`],{cwd:dir,encoding:'utf8'});
      assert.equal(rows.stdout,'preserve me');
      assert.equal(await readFile(join(dir,'public_html/index.php'),'utf8'),scenario==='valid'?router:'old router');
      if(scenario!=='valid')assert.equal(existsSync(join(privateDir,'releases',id)),false);
    }finally{await rm(dir,{recursive:true,force:true});}
  }
});

test('Timeweb generator rejects invalid release identifiers',()=>{
  assert.throws(()=>activationScript({id:'../config',expected:old,hash:'0'.repeat(64),router}));
});
