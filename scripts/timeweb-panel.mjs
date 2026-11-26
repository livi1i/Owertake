import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';

export function activationScript({id, hash, expected, router}) {
  for (const value of [id, expected]) if (!/^[a-f0-9]{16}$/.test(value)) throw Error('Invalid release ID');
  if (!/^[a-f0-9]{64}$/.test(hash)) throw Error('Invalid hash');
  return `<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli')exit('CLI only');
function checked_write(string $path,string $data):void{if(file_put_contents($path,$data)!==strlen($data))throw new RuntimeException('Write failed');}
$base=__DIR__;$private=$base.'/overtake-private';
if(!is_file($private.'/config.json')||!is_file($private.'/current')||!is_file($private.'/data.sqlite')||!is_dir($base.'/public_html'))throw new RuntimeException('Existing installation required');
$lock=fopen($private.'/deploy.lock','c');if(!$lock||!flock($lock,LOCK_EX))throw new RuntimeException('Cannot lock deployment');
$current=trim(file_get_contents($private.'/current'));
if($current!=='${expected}')throw new RuntimeException('Server changed since preparation; prepare a fresh release. Nothing switched.');
$raw=file_get_contents($base.'/overtake-release-${id}.json');
if(hash('sha256',$raw)!=='${hash}')throw new RuntimeException('Manifest hash mismatch');
$files=json_decode($raw,true,512,JSON_THROW_ON_ERROR);
if(!is_array($files)||count($files)>300||!isset($files['api.php'],$files['client/index.html']))throw new RuntimeException('Invalid release');
$decoded=[];foreach($files as $name=>$value){if($name!=='api.php'&&$name!=='client/index.html'&&!preg_match('~^client/assets/[A-Za-z0-9_.-]+\\.(js|css|svg|woff2|png|webp)$~D',$name))throw new RuntimeException('Invalid path');if(!is_string($value)||($data=base64_decode($value,true))===false)throw new RuntimeException('Invalid content');$decoded[$name]=$data;}
$dir=$private.'/releases/${id}';if(is_dir($dir))throw new RuntimeException('Release already exists');
$backup=$private.'/backup-'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(3));if(!mkdir($backup,0700))throw new RuntimeException('Backup directory failed');
if(!copy($private.'/current',$backup.'/current')||!copy($base.'/public_html/index.php',$backup.'/index.php'))throw new RuntimeException('Backup failed');
$db=new PDO('sqlite:'.$private.'/data.sqlite');$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);$db->exec('PRAGMA busy_timeout=10000');$db->exec('VACUUM INTO '.$db->quote($backup.'/data.sqlite'));chmod($backup.'/data.sqlite',0600);$db=null;
if(!mkdir($dir.'/client/assets',0700,true))throw new RuntimeException('Release directory failed');
foreach($decoded as $name=>$data){checked_write($dir.'/'.$name,$data);if(hash_file('sha256',$dir.'/'.$name)!==hash('sha256',$data))throw new RuntimeException('File verification failed');}
checked_write($base.'/public_html/index.php.next',base64_decode('${Buffer.from(router).toString('base64')}',true));
if(!rename($base.'/public_html/index.php.next',$base.'/public_html/index.php'))throw new RuntimeException('Router switch failed');
checked_write($private.'/current.next','${id}');if(!rename($private.'/current.next',$private.'/current'))throw new RuntimeException('Release switch failed');
flock($lock,LOCK_UN);echo 'Activated ${id}; previous ${expected}; backup='.basename($backup).PHP_EOL;
`;
}

export async function preparePanelRelease(path, id) {
  const origin='https://helmerzy.tw1.ru';
  const response=await fetch(origin+'/api/health',{headers:{'Cache-Control':'no-cache'}});
  if(!response.ok||response.headers.get('x-overtake-router')!=='seo-v1')throw Error('Cannot verify existing Timeweb installation');
  const health=await response.json();
  if(!health.ok||!/^[a-f0-9]{16}$/.test(health.release))throw Error('Invalid server release');
  const raw=await readFile(path);
  const hash=createHash('sha256').update(raw).digest('hex');
  const script=activationScript({id,hash,expected:health.release,router:await readFile('server/timeweb-index.php','utf8')});
  const dir='.local/timeweb-update';await mkdir(dir,{recursive:true});
  await writeFile(dir+`/overtake-release-${id}.json`,raw);
  await writeFile(dir+`/activate-${id}.php`,script);
  await writeFile(dir+'/README.txt',`Target: ${origin}\nExpected current release: ${health.release}\nNew release: ${id}\nSHA256: ${hash}\nUpload the JSON and PHP files to /home/h/helmerzy/overtake (outside public_html).\nRun in Timeweb SSH console: php /home/h/helmerzy/overtake/activate-${id}.php\nExisting database and config are NOT replaced. See TIMEWEB.md.\n`);
  console.log(`Prepared ${dir}; expected server release ${health.release}. Not deployed.`);
}
