import {pricebook} from "../src/lib/public-prices.ts";
import {existsSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {seoContent,seoResolve,seoHtml,seoRobots,seoSitemap} from "../server/seo.mjs";
import {defaultAgencyServices} from "../src/lib/services.ts";
import {portfolioConcepts} from "../src/lib/portfolio.ts";
import {defaultFaq} from "../src/lib/faq.ts";
const seoDefaults={services:defaultAgencyServices,projects:portfolioConcepts,faq:defaultFaq};
import { createServer } from "vite";
import { api } from "../server/api.mjs";
import { database } from "./local-db.mjs";
const os5 = process.env.OVERTAKE_OS5_PREVIEW === "1" || process.argv.includes('--os5');
const prices = os5 ? pricebook().flatMap(group=>group.offers).map(({amount,...item})=>({...item,minor:Math.round(amount*100)})) : undefined;
const db = database(os5?".local/overtake-os5-preview.sqlite":".local/overtake.sqlite",{os5});
const port = Number(process.env.OVERTAKE_PREVIEW_PORT || 5178);
const origin = "http://127.0.0.1:" + port;
const server = await createServer({
  server: { host: "127.0.0.1", port, strictPort: true },
  plugins: [
    {
      name: "api",
      configureServer(s) {
        s.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith("/api/")) {
            const path=new URL(req.url,origin).pathname;
            if(path.startsWith('/assets/')){if(!/^\/assets\/[A-Za-z0-9_.-]+$/.test(path)||!existsSync('public'+path)){res.writeHead(404);res.end();return;}return next();}
            if(!['GET','HEAD'].includes(req.method)||path.startsWith('/src/')||path.startsWith('/node_modules/')||path.startsWith('/@'))return next();
            if(os5&&/^\/cabinet(?:\/[a-z-]+)?$/.test(path)){
              res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
              res.end(req.method==='HEAD'?undefined:await readFile('src/os5/workspace.html','utf8'));
              return;
            }
            if(path==='/pricing'){res.writeHead(301,{Location:'/services?view=pricing'});res.end();return;}
            try{const data=await seoContent(db,seoDefaults);let body,status=200,type='text/html; charset=utf-8';
              if(path==='/robots.txt'){body=seoRobots(origin);type='text/plain; charset=utf-8';}
              else if(path==='/sitemap.xml'){body=seoSitemap(data,origin);type='application/xml; charset=utf-8';}
              else {const page=seoResolve(path,data);if(page.redirect){res.writeHead(page.status,{Location:page.redirect});res.end();return;}status=page.status;body=seoHtml(await s.transformIndexHtml(path,await readFile('index.html','utf8')),path,page,origin);}
              res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});res.end(req.method==='HEAD'?undefined:body);return;
            }catch(e){console.error(e);res.writeHead(503);res.end('Preview unavailable');return;}
          }
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
              if (chunks.reduce((n, c) => n + c.length, 0) > ((/^\/api\/os5\/invoices\/[^/]+\/(issue|signed)$/.test(req.url)||/^\/api\/leads\/[\w-]+\/attachments$/.test(req.url)) && req.method === "POST" ? 710000 : 21000)) {
                res.writeHead(413);
                res.end();
                return;
              }
            }
            const method = req.method;
            const r = await api(
              new Request("http://" + req.headers.host + req.url, {
                method,
                headers: req.headers,
                body: ["GET", "HEAD"].includes(method)
                  ? undefined
                  : Buffer.concat(chunks),
                duplex: "half",
              }),
              { DB: db, OS5_PRICES:prices },
            );
            res.writeHead(r.status, Object.fromEntries(r.headers));
            res.end(Buffer.from(await r.arrayBuffer()));
          } catch (e) {
            console.error(e);
            res.writeHead(500);
            res.end("Server error");
          }
        });
      },
    },
  ],
});
await server.listen();
server.printUrls();
