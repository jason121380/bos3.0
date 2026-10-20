// 日期選擇器互動比對（真實瀏覽器）：9 種操作後比對兩邊的回呼序列，印出 SAME／DIFF。
// 用法：ESBUILD=… node ../build.js date-picker-entry.js <out>；NODE_PATH=<playwright> node date-picker-run.js <out> <mock build>
const fs=require('fs'),path=require('path'),http=require('http');const {chromium}=require('playwright')
const out=process.argv[2],build=process.argv[3];const cssd=path.join(build,'static/css');const main=fs.readdirSync(cssd).find(f=>f.startsWith('main.'))
const html=`<!doctype html><html><head><meta charset="utf8"><link rel="stylesheet" href="/b/static/css/${main}"><link rel="stylesheet" href="/h/entry.css"></head><body><div id="root"></div><script src="/h/entry.js"></script></body></html>`
http.createServer((q,r)=>{const u=q.url.split('?')[0];if(u==='/'){r.end(html);return}const p=u.startsWith('/b/')?path.join(build,u.slice(3)):path.join(out,u.slice(3));r.writeHead(200,{'Content-Type':p.endsWith('.css')?'text/css':'application/javascript'});fs.createReadStream(p).pipe(r)}).listen(5099,async()=>{
const b=await chromium.launch();const errs=[]
const run=async(kind,steps)=>{const ctx=await b.newContext({viewport:{width:1000,height:800},hasTouch:false});const pg=await ctx.newPage();await pg.clock.setFixedTime(new Date('2026-10-20T10:00:00+08:00'));pg.on('pageerror',e=>errs.push(kind+': '+e.message));await pg.goto('http://127.0.0.1:5099/?'+kind);await pg.waitForTimeout(300)
 for(const tag of ['m','c']){await steps(pg,tag);await pg.waitForTimeout(250)}
 const logs=await pg.evaluate(()=>window.__log);const same=JSON.stringify(logs.m)===JSON.stringify(logs.c)
 console.log((same?'SAME ':'DIFF ')+kind);if(!same){console.log('  MUI :',JSON.stringify(logs.m));console.log('  ours:',JSON.stringify(logs.c))}else console.log('  ',JSON.stringify(logs.m));await ctx.close()}
const dlg=pg=>pg.locator('[role=dialog]').last()
const day=async(pg,n)=>{await dlg(pg).locator('button[role=gridcell]').filter({hasText:new RegExp('^'+n+'$')}).first().click()}
await run('selectClose',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.waitForTimeout(300);await day(pg,25)})
await run('cancelOk',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.waitForTimeout(300);await day(pg,22);await pg.waitForTimeout(100);await pg.getByRole('button',{name:'取消'}).last().click();await pg.waitForTimeout(300);await pg.click('#'+t+'-f');await pg.waitForTimeout(300);await day(pg,23);await pg.waitForTimeout(100);await pg.getByRole('button',{name:'確認'}).last().click()})
await run('monthYear',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.waitForTimeout(300);await dlg(pg).locator('button[role=radio]').filter({hasText:/^11月$/}).click();await pg.waitForTimeout(300);await dlg(pg).locator('button[role=radio]').filter({hasText:/^2027$/}).click()})
await run('openYear',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.waitForTimeout(300);await dlg(pg).locator('button[role=radio]').filter({hasText:/^1990$/}).click();await pg.waitForTimeout(300);await day(pg,5)})
await run('minDate',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.waitForTimeout(300);const d=await dlg(pg).locator('button[role=gridcell]').filter({hasText:/^19$/}).first().isDisabled();require('fs').appendFileSync('/dev/stdout','  '+t+' 19 disabled='+d+'\n');await day(pg,28);await pg.getByRole('button',{name:'確認'}).last().click()})
await run('type',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.keyboard.type('20261005');await pg.waitForTimeout(100);await pg.keyboard.press('Backspace');await pg.waitForTimeout(100);await pg.keyboard.type('31');await pg.waitForTimeout(100);await pg.keyboard.press('ArrowLeft');await pg.keyboard.type('02');await pg.waitForTimeout(100);await pg.keyboard.press('Tab')})
await run('dtType',async(pg,t)=>{await pg.click('#'+t+'-f');await pg.keyboard.type('202610051430');await pg.waitForTimeout(100);await pg.keyboard.press('Tab')})
await run('desktopPick',async(pg,t)=>{await pg.locator('#'+t+' button[aria-label^="Choose date"]').click();await pg.waitForTimeout(400);await pg.locator('[role=dialog] button[role=gridcell]').filter({hasText:/^12$/}).first().click();await pg.waitForTimeout(300);const open=await pg.locator('[role=dialog] button[role=gridcell]').count();require('fs').appendFileSync('/dev/stdout','  '+t+' still open cells='+open+'\n')})
await run('future',async(pg,t)=>{await pg.waitForTimeout(50)})
console.log('errors',errs.slice(0,5));await b.close();process.exit(0)})
