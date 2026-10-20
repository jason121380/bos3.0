// 零星元件互動測試（真實瀏覽器）：Tooltip 滑入、Slider 數值泡泡、Rating 點選、Menu 開關與鍵盤，MUI 與相容層並排截圖。
// 用法：ESBUILD=… node ../build.js misc-entry.js <out>；NODE_PATH=<playwright> node misc-run.js <out> <mock build>
const fs=require('fs'),path=require('path'),http=require('http');const {chromium}=require('playwright')
const out=process.argv[2],build=process.argv[3];const cssd=path.join(build,'static/css');const main=fs.readdirSync(cssd).find(f=>f.startsWith('main.'))
const html=`<!doctype html><html><head><meta charset="utf8"><link rel="stylesheet" href="/b/static/css/${main}"><link rel="stylesheet" href="/h/entry.css"></head><body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
http.createServer((q,r)=>{const u=q.url.split('?')[0];if(u==='/'){r.end(html);return}const p=u.startsWith('/b/')?path.join(build,u.slice(3)):path.join(out,u.slice(3));r.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'application/javascript'});fs.createReadStream(p).pipe(r)}).listen(5097,async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:420}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto('http://127.0.0.1:5097/');await pg.waitForTimeout(500)
await pg.screenshot({path:path.join(out,'1-static.png')})
for(const t of ['m','c']){await pg.hover('#'+t+'tt');await pg.waitForTimeout(400);await pg.screenshot({path:path.join(out,'2-tooltip-'+t+'.png')});await pg.mouse.move(890,410);await pg.waitForTimeout(300)}
for(const t of ['m','c']){const box=await pg.locator('#'+t+' input[type=range], #'+t+' .MuiSlider-root').first().boundingBox();await pg.mouse.move(box.x+box.width/2,box.y+box.height/2);await pg.waitForTimeout(400);await pg.screenshot({path:path.join(out,'3-slider-'+t+'.png')});await pg.mouse.move(890,410);await pg.waitForTimeout(300)}
// Rating：點第 5 顆
for(const t of ['m','c']){const stars=pg.locator('#'+t+' .MuiRating-root label');await stars.nth(4).click();await pg.waitForTimeout(200);console.log('rating',t,await pg.locator('#'+t+'rv').textContent())}
// Menu：開啟、Esc 關閉、再開啟點選項
for(const t of ['m','c']){await pg.click('#'+t+'mb');await pg.waitForTimeout(400);await pg.screenshot({path:path.join(out,'4-menu-'+t+'.png')});const focused=await pg.evaluate(()=>document.activeElement.getAttribute('role'));await pg.keyboard.press('Escape');await pg.waitForTimeout(300);const closed=await pg.locator('[role=menu]').count();await pg.click('#'+t+'mb');await pg.waitForTimeout(300);await pg.keyboard.press('Enter');await pg.waitForTimeout(300);console.log('menu',t,'focus=',focused,'afterEsc=',closed,'enter→',await pg.evaluate(()=>window.__menu),'open=',await pg.locator('[role=menu]').count())}
console.log('errors',errs.slice(0,3));await b.close();process.exit(0)})
