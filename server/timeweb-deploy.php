<?php
declare(strict_types=1);
header('Content-Type: application/json');header('Cache-Control: no-store');
function respond($data,$status=200){http_response_code($status);echo json_encode($data);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST')respond(['error'=>'Method not allowed'],405);
$private=dirname(__DIR__).'/overtake-private';$config=json_decode(file_get_contents($private.'/config.json'),true);
$raw=file_get_contents('php://input',false,null,0,8000001);if(strlen($raw)>8000000)respond(['error'=>'Too large'],413);
$signature=$_SERVER['HTTP_X_OVERTAKE_SIGNATURE']??'';if(!hash_equals(hash_hmac('sha256',$raw,$config['deploy_key']),$signature))respond(['error'=>'Unauthorized'],401);
$body=json_decode($raw,true);if(!is_array($body)||abs(time()-($body['timestamp']??0))>120||!preg_match('/^[a-f0-9]{32}$/',$body['nonce']??''))respond(['error'=>'Expired or invalid request'],400);
$lock=fopen($private.'/deploy.lock','c');flock($lock,LOCK_EX);
if(file_exists($private.'/nonce-'.$body['nonce']))respond(['error'=>'Replay'],409);file_put_contents($private.'/nonce-'.$body['nonce'],'1');
$files=$body['files']??[];if(!is_array($files)||count($files)>100||!isset($files['client/index.html'],$files['api.php']))respond(['error'=>'Invalid release'],400);
$decoded=[];foreach($files as $name=>$value){if($name!=='client/index.html'&&$name!=='api.php'&&!preg_match('~^client/assets/[A-Za-z0-9_.-]+\.(js|css|svg|woff2)$~',$name))respond(['error'=>'Invalid path'],400);$data=base64_decode($value,true);if($data===false)respond(['error'=>'Invalid content'],400);$decoded[$name]=$data;}
$version=substr(hash('sha256',$raw),0,16);$dir=$private.'/releases/'.$version;mkdir($dir.'/client/assets',0700,true);foreach($decoded as $name=>$data)if(file_put_contents($dir.'/'.$name,$data)===false)respond(['error'=>'Write failed'],500);
file_put_contents($private.'/current.next',$version);if(!rename($private.'/current.next',$private.'/current'))respond(['error'=>'Switch failed'],500);
flock($lock,LOCK_UN);respond(['ok'=>true,'release'=>$version]);
