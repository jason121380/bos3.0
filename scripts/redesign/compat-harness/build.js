// 用法：ESBUILD=<esbuild 套件路徑> node build.js <entry.js> <outDir>
// 以 esbuild 打包比對頁（解析 repo 的 src 絕對路徑與 node_modules）。esbuild 不在專案依賴內，先裝在 repo 外：
//   npm i --prefix /tmp/esb esbuild@0.20.2 && export ESBUILD=/tmp/esb/node_modules/esbuild
// 保留供日期選擇器、正式圖層／元件與列印比較入口建置；舊相容元件比較入口已退役。
// 正式入口不需要安裝 MUI。歷史比對主題 mui-theme.js 已刪除，不要再引用。
const path = require('path')
const repo = path.resolve(__dirname, '../../..')
require(process.env.ESBUILD || 'esbuild').build({
  entryPoints: [process.argv[2]],
  bundle: true,
  entryNames: 'entry',
  outdir: process.argv[3],
  nodePaths: [path.join(repo, 'src'), path.join(repo, 'node_modules')],
  loader: { '.js': 'jsx', '.svg': 'dataurl', '.png': 'dataurl' },
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"', global: 'window' },
  logLevel: 'error',
}).then(() => console.log('built'))
