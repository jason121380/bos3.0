// 樹狀選單互動測試（真實瀏覽器）：點擊展開、選取、onClick、鍵盤，比對 MUI 與相容層的 aria-expanded／Mui-selected／Mui-focused 狀態。
// 用法：ESBUILD=… node ../build.js ../tree-entry.js <out>；NODE_PATH=<playwright> node tree-run.js <out> <mock build>
const fs=require('fs'),path=require('path'),http=require('http');const {chromium}=require('playwright')
const out=process.argv[2],build=process.argv[3];const cssd=path.join(build,'static/css');const main=fs.readdirSync(cssd).find(f=>f.startsWith('main.'))
const html=`<!doctype html><html><head><meta charset="utf8"><link rel="stylesheet" href="/b/static/css/${main}"><link rel="stylesheet" href="/h/entry.css"></head><body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
http.createServer((q,r)=>{const u=q.url.split('?')[0];if(u==='/'){r.end(html);return}const p=u.startsWith('/b/')?path.join(build,u.slice(3)):path.join(out,u.slice(3));r.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'application/javascript'});fs.createReadStream(p).pipe(r)}).listen(5098,async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto('http://127.0.0.1:5098/');await pg.waitForTimeout(400)
const state=()=>pg.evaluate(()=>['mui','compat'].map(t=>Array.from(document.querySelectorAll('#'+t+' [role=treeitem]')).map(li=>{const c=li.firstElementChild;return li.textContent.slice(0,4)+':'+(li.getAttribute('aria-expanded')||'-')+(c.classList.contains('Mui-selected')?'S':'')+(c.classList.contains('Mui-focused')?'F':'')}).join(' ')))
console.log('init  ',await state())
for(const t of ['mui','compat']){await pg.locator('#'+t+' .MuiTreeItem-content',{hasText:'群組一'}).click();await pg.waitForTimeout(150)}
console.log('G1    ',await state())
for(const t of ['mui','compat']){await pg.locator('#'+t+' .MuiTreeItem-content',{hasText:'店家乙'}).click();await pg.waitForTimeout(150)}
console.log('m2    ',await state(), await pg.evaluate(()=>[window.clickedm,window.clickedc]))
for(const t of ['mui','compat']){await pg.locator('#'+t+' .MuiTreeItem-content',{hasText:'全部'}).click();await pg.waitForTimeout(150)}
console.log('ALL   ',await state())
for(const t of ['mui','compat']){await pg.locator('#'+t+' .MuiTreeItem-content',{hasText:'群組一'}).click();await pg.waitForTimeout(100);await pg.keyboard.press('ArrowDown');await pg.waitForTimeout(100)}
console.log('kbd   ',await state())
console.log('errors',errs.slice(0,3));await b.close();process.exit(0)})
