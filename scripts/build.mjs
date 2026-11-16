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
const api = await readFile("server/api.mjs", "utf8");
const wrapper = `\nconst assets=${JSON.stringify(assets)};\nexport default {async fetch(req,env){const path=new URL(req.url).pathname;if(path.startsWith('/api/'))return api(req,env);const key=assets[path]?path:'/index.html';const mime=key.endsWith('.js')?'application/javascript':key.endsWith('.css')?'text/css':key.endsWith('.svg')?'image/svg+xml':'text/html';return new Response(assets[key],{headers:{'Content-Type':mime+'; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Cache-Control':key.startsWith('/assets/')?'public,max-age=31536000,immutable':'no-cache'}})}};`;
await writeFile("dist/server/index.js", api + wrapper);
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/drizzle", { recursive: true });
console.log("Worker build ready");
