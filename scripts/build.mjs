import {pricebook} from "../src/lib/public-prices.ts";
import {defaultAgencyServices} from "../src/lib/services.ts";
import {portfolioConcepts} from "../src/lib/portfolio.ts";
import {defaultFaq} from "../src/lib/faq.ts";
const seoDefaults={services:defaultAgencyServices,projects:portfolioConcepts,faq:defaultFaq};
import { build } from "vite";
import { readFile, writeFile, mkdir, readdir, cp } from "node:fs/promises";
await build({
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warn, handler) {
        if (
          warn.code === "MODULE_LEVEL_DIRECTIVE" ||
          warn.code === "SOURCEMAP_ERROR"
        )
          return;
        handler(warn);
      },
    },
  },
});
await writeFile("dist/client/assets/seo-data.js",JSON.stringify(seoDefaults));
const assets = {};
async function collect(dir, base = "") {
  for (const f of await readdir(dir, { withFileTypes: true })) {
    if (f.isDirectory()) await collect(dir + "/" + f.name, base + "/" + f.name);
    else
      assets[base + "/" + f.name] = await readFile(dir + "/" + f.name, "utf8");
  }
}
await collect("dist/client");
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
const api = (await readFile("server/api.mjs", "utf8")).replace(/^import \{os5[^\n]+\n/,"");
const os5 = await readFile("server/os5.mjs", "utf8");
const os5Prices=pricebook().flatMap(group=>group.offers).map(({amount,...item})=>({...item,minor:Math.round(amount*100)}));
const seo = await readFile("server/seo.mjs", "utf8");
const wrapper = `
const assets=${JSON.stringify(assets)};
const seoDefaults=${JSON.stringify(seoDefaults)};
export default {async fetch(req,env){const url=new URL(req.url),path=url.pathname;if(path.startsWith('/api/'))return api(req,{...env,OS5_PRICES:env.OS5_ENABLED==="1"?${JSON.stringify(os5Prices)}:undefined});if(!['GET','HEAD'].includes(req.method))return new Response('Method not allowed',{status:405});if(path==='/pricing')return new Response(null,{status:301,headers:{Location:'/services?view=pricing'}});let body,status=200,mime='text/html; charset=utf-8';const origin=['localhost','127.0.0.1','[::1]'].includes(url.hostname)?url.origin:seoPublicOrigin;if(path.startsWith('/assets/')){if(!assets[path])return new Response('Not found',{status:404});body=assets[path];mime=path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':'application/javascript';}else{const data=await seoContent(env.DB,seoDefaults);if(path==='/robots.txt'){body=seoRobots(origin);mime='text/plain; charset=utf-8';}else if(path==='/sitemap.xml'){body=seoSitemap(data,origin);mime='application/xml; charset=utf-8';}else{const page=seoResolve(path,data);if(page.redirect)return new Response(null,{status:page.status,headers:{Location:page.redirect}});status=page.status;body=seoHtml(assets['/index.html'],path,page,origin);}}return new Response(req.method==='HEAD'?null:body,{status,headers:{'Content-Type':mime,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':path.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache',...(origin===seoPublicOrigin?{}:{'X-Robots-Tag':'noindex, nofollow'})}})}};`;
await writeFile("dist/server/index.js", api + "\n" + os5 + "\n" + seo + wrapper);
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/drizzle", { recursive: true });
console.log("Worker build ready");
