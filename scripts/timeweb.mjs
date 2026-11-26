import {pricebook} from "../src/lib/public-prices.ts";
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const mode=process.argv[2]||'release';
if(!['release','deploy'].includes(mode))throw Error('Initial-install package retired. Use npm run release:timeweb for application-only updates.');
await mkdir('.local',{recursive:true});
const os5Prices=pricebook().flatMap(group=>group.offers).map(({amount,...item})=>({...item,minor:Math.round(amount*100)}));
const os5PricePhp="const OS5_PRICEBOOK='"+Buffer.from(JSON.stringify(os5Prices)).toString('base64')+"';\n";
const os5Php=(await readFile('server/timeweb-os5.php','utf8')).replace(/^<\?php\s*/, '');
const seoPhp=(await readFile('server/timeweb-seo.php','utf8')).replace(/^<\?php\s*/, '');const apiPhp=(await readFile('server/timeweb-api.php','utf8')).replace('declare(strict_types=1);','declare(strict_types=1);\n'+os5PricePhp+os5Php+'\n'+seoPhp);
const files={'client/index.html':(await readFile('dist/client/index.html')).toString('base64'),'api.php':Buffer.from(apiPhp).toString('base64')};for(const f of await readdir('dist/client/assets'))files['client/assets/'+f]=(await readFile('dist/client/assets/'+f)).toString('base64');
if(mode==='release'){
 const manifest=JSON.stringify(files);
 const id=createHash('sha256').update(manifest).digest('hex').slice(0,16);
 const path='.local/overtake-release-'+id+'.json';
 await writeFile(path,manifest);
 console.log('Prepared '+path+' (application files only)');
 const {preparePanelRelease}=await import('./timeweb-panel.mjs');
 await preparePanelRelease(path,id);
 process.exit(0);
}
throw Error('Direct HTTP deployment is unavailable for this installation (8 MB limit). Run npm run release:timeweb and follow TIMEWEB.md. No upload performed.');
