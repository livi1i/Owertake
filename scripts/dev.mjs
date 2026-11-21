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
const db = database(".local/overtake.sqlite");
const server = await createServer({
  server: { host: "127.0.0.1", port: 5178, strictPort: true },
  plugins: [
    {
      name: "api",
      configureServer(s) {
        s.middlewares.use(async (req, res, next) => {
          if (!req.url.startsWith("/api/")) {
            const path=new URL(req.url,'http://127.0.0.1:5178').pathname;
            if(path.startsWith('/assets/')){if(!/^\/assets\/[A-Za-z0-9_.-]+$/.test(path)||!existsSync('public'+path)){res.writeHead(404);res.end();return;}return next();}
            if(!['GET','HEAD'].includes(req.method)||path.startsWith('/src/')||path.startsWith('/node_modules/')||path.startsWith('/@'))return next();
            try{const origin='http://127.0.0.1:5178';const data=await seoContent(db,seoDefaults);let body,status=200,type='text/html; charset=utf-8';
              if(path==='/robots.txt'){body=seoRobots(origin);type='text/plain; charset=utf-8';}
              else if(path==='/sitemap.xml'){body=seoSitemap(data,origin);type='application/xml; charset=utf-8';}
              else {const page=seoResolve(path,data);status=page.status;body=seoHtml(await s.transformIndexHtml(path,await readFile('index.html','utf8')),path,page,origin);}
              res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});res.end(req.method==='HEAD'?undefined:body);return;
            }catch(e){console.error(e);res.writeHead(503);res.end('Preview unavailable');return;}
          }
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
              if (chunks.reduce((n, c) => n + c.length, 0) > (/^\/api\/leads\/[\w-]+\/attachments$/.test(req.url) && req.method === "POST" ? 710000 : 21000)) {
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
              { DB: db },
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
