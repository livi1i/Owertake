import {createServer} from 'vite';
import {api} from '../server/api.mjs';
import {database} from './local-db.mjs';
const db=database('.local/overtake.sqlite');
const server=await createServer({server:{host:'127.0.0.1',port:5178,strictPort:true},plugins:[{name:'api',configureServer(s){s.middlewares.use(async(req,res,next)=>{if(!req.url.startsWith('/api/'))return next();try{const chunks=[];for await(const chunk of req){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>21000){res.writeHead(413);res.end();return}}const method=req.method;const r=await api(new Request('http://'+req.headers.host+req.url,{method,headers:req.headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(chunks),duplex:'half'}),{DB:db});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()))}catch(e){console.error(e);res.writeHead(500);res.end('Server error')}})}}]});await server.listen();server.printUrls();
