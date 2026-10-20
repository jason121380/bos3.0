// 彈窗互動測試（真實瀏覽器）：自家 Dialog 內開 MUI 日期選擇器（焦點、Esc 分層）、自家 Modal 內的搜尋下拉。
// 用法：ESBUILD=… node ../build.js modal-layers-entry.js <out>；NODE_PATH=<playwright> node modal-layers-run.js <out> <mock build>
const fs=require('fs'),path=require('path'),http=require('http');const {chromium}=require('playwright')
const out=process.argv[2], build=process.argv[3]
const cssd=path.join(build,'static/css');const main=fs.readdirSync(cssd).find(f=>f.startsWith('main.'))
const html=`<!doctype html><html><head><meta charset="utf8"><link rel="stylesheet" href="/b/static/css/${main}"><link rel="stylesheet" href="/h/entry.css"></head><body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
http.createServer((q,r)=>{const u=q.url.split('?')[0];if(u==='/'){r.end(html);return}const p=u.startsWith('/b/')?path.join(build,u.slice(3)):path.join(out,u.slice(3));if(!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'application/javascript'});fs.createReadStream(p).pipe(r)}).listen(5095,async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message))
const where=()=>pg.evaluate(()=>{const a=document.activeElement;return (a.closest('[data-ours]')?'自家對話框':a.closest('.MuiModal-root')?'MUI 日期面板':'頁面')+' '+a.tagName+(a.getAttribute('aria-label')?'['+a.getAttribute('aria-label')+']':'')})
// A：自家 Dialog 內開 MUI 日期選擇器
await pg.goto('http://127.0.0.1:5095/?a');await pg.waitForTimeout(400)
console.log('A1 開啟後焦點：',await where())
await pg.locator('.MuiDialog-root input, .MuiDialog-root button').first().click();await pg.waitForTimeout(600)
const pickers=await pg.locator('.MuiPickersLayout-root, .MuiDateCalendar-root').count()
console.log('A2 日期面板數：',pickers,' 焦點：',await where())
await pg.keyboard.press('ArrowRight');await pg.waitForTimeout(150)
console.log('A3 方向鍵後焦點：',await where())
await pg.getByRole('gridcell',{name:'25'}).first().click();await pg.waitForTimeout(500)
console.log('A4 選 25 日後：',await pg.locator('#picked').textContent(),' 日期面板數：',await pg.locator('.MuiDateCalendar-root').count(),' 焦點：',await where())
await pg.keyboard.press('Escape');await pg.waitForTimeout(300)
console.log('A5 第一次 Esc：日期面板數',await pg.locator('.MuiDateCalendar-root').count(),' 自家仍開：',await pg.locator('[data-ours]').count(),' 焦點：',await where())
await pg.keyboard.press('Escape');await pg.waitForTimeout(300)
console.log('A6 第二次 Esc reason：',await pg.evaluate(()=>window.__closed),' 自家仍開：',await pg.locator('[data-ours]').count())
// B：自家 Modal 內的搜尋下拉
await pg.goto('http://127.0.0.1:5095/?b');await pg.waitForTimeout(400)
await pg.getByLabel('服務').click();await pg.keyboard.type('染');await pg.waitForTimeout(300)
console.log('B1 選項：',await pg.getByRole('option').allTextContents(),' 焦點：',await where())
await pg.getByRole('option',{name:'染髮'}).click();await pg.waitForTimeout(200)
console.log('B2 選取結果：',await pg.locator('#svc').textContent())
console.log('errors',errs.slice(0,3));await b.close();process.exit(0)})
