// 用法：ESBUILD=<esbuild 套件路徑> node build.js <entry.js> <outDir>
// 以 esbuild 打包比對頁（解析 repo 的 src 絕對路徑與 node_modules）。esbuild 不在專案依賴內，先裝在 repo 外：
//   npm i --prefix /tmp/esb esbuild@0.20.2 && export ESBUILD=/tmp/esb/node_modules/esbuild
// 2026/10/20 起專案已移除 @mui 套件；比對頁的 MUI 原版（與本資料夾的 mui-theme.js 橋接主題）需臨時安裝、不寫入 package.json：
//   npm i --no-save --legacy-peer-deps @mui/material@5.15.7 @mui/x-date-pickers@6.19.4 @mui/x-tree-view@6.17.0
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
