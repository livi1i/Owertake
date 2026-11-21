<?php
declare(strict_types=1);
$private=dirname(__DIR__).'/overtake-private';
$config=json_decode(file_get_contents($private.'/config.json'),true,512,JSON_THROW_ON_ERROR);
$version=trim(file_get_contents($private.'/current'));
if(!preg_match('/^[a-f0-9]{16}$/',$version)){http_response_code(503);exit('Deployment unavailable');}
$release=$private.'/releases/'.$version;
header('X-Overtake-Router: seo-v1');header('X-Content-Type-Options: nosniff');header('X-Frame-Options: DENY');header('Referrer-Policy: strict-origin-when-cross-origin');
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if(str_starts_with($path,'/api/')){require $release.'/api.php';exit;}
if(!in_array($_SERVER['REQUEST_METHOD'],['GET','HEAD'],true)){http_response_code(405);exit;}
if(str_starts_with($path,'/assets/')){
 if(!preg_match('~^/assets/[A-Za-z0-9_.-]+\.(js|css|svg|woff2)$~',$path,$m)){http_response_code(404);exit;}
 $file=$release.'/client'.$path;if(!is_file($file)){http_response_code(404);exit;}
 header('Content-Type: '.(['js'=>'application/javascript','css'=>'text/css','svg'=>'image/svg+xml','woff2'=>'font/woff2'][$m[1]]));header('Cache-Control: public,max-age=31536000,immutable');
}else{if(is_file($release.'/client/assets/seo-data.js')){require $release.'/api.php';exit;}$file=$release.'/client/index.html';header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-cache');}
if($_SERVER['REQUEST_METHOD']!=='HEAD')readfile($file);
