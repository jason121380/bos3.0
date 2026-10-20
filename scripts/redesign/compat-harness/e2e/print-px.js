// 用法見 print-entry.js 檔頭：SIDE='#m' 或 '#c' 時只渲染一側，輸出 px-<kind>-<screen|print>-<mui|compat>.png 供逐像素比對
const fs=require('fs'),path=require('path'),http=require('http');const {chromium}=require('playwright')
const out=process.argv[2],build=process.argv[3];const cssd=path.join(build,'static/css');const files=fs.readdirSync(cssd);const main=files.find(f=>f.startsWith('main.'))
const globalCss=files.find(f=>{const t=fs.readFileSync(path.join(cssd,f),'utf8');return t.includes('merchantNamePrint')&&!t.includes('#1f1f1f')})
const html=`<!doctype html><html><head><meta charset="utf8"><link rel="stylesheet" href="/b/static/css/${main}"><link rel="stylesheet" href="/h/entry.css"></head><body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
http.createServer((q,r)=>{const u=q.url.split('?')[0];if(u==='/'){r.end(html);return}const p=u.startsWith('/b/')?path.join(build,u.slice(3)):path.join(out,u.slice(3));if(!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'application/javascript'});fs.createReadStream(p).pipe(r)}).listen(5105,async()=>{
const b=await chromium.launch()
for(const kind of ['mdr','ddr','td'])for(const media of ['screen','print']){const pg=await b.newPage({viewport:{width:1200,height:900}});await pg.goto('http://127.0.0.1:5105/?'+kind+(process.env.SIDE||''));await pg.addStyleTag({path:path.join(cssd,globalCss)});await pg.emulateMedia({media});await pg.addStyleTag({content:'input{caret-color:transparent}'});await pg.waitForTimeout(400)
 for(const id of ['mui','compat']){const h=await pg.$('#'+id);if(!h)continue;const box=await h.boundingBox();if(!box||!box.height){console.log(kind,media,id,'not visible');continue}await pg.screenshot({fullPage:true,clip:box,path:path.join(out,`px-${kind}-${media}-${id}.png`)})}await pg.close()}
await b.close();process.exit(0)})
