// Vite 建置設定（2026/10/20 由 CRA／craco 改為 Vite；React 仍為 17）。
// 與原 CRA 行為對齊的重點：
//   - src/*.js 內含 JSX（CRA 允許），以 esbuild 的 jsx loader 處理
//   - jsconfig 的 baseUrl: src（import 'ui/button'、'views/…'）改以 alias 對應 src 下的頂層資料夾
//   - 環境變數沿用 REACT_APP_ 前綴與 process.env.*（含 PUBLIC_URL、NODE_ENV），不改程式碼
//   - 輸出到 build/（Dockerfile、cloudbuild 皆讀 build/）；可用 BUILD_PATH 覆寫（同 CRA）；不產生 sourcemap（原 GENERATE_SOURCEMAP=false）
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const src = path.resolve(__dirname, 'src')
const srcRoots = fs
  .readdirSync(src, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_')
  const define = {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    'process.env.PUBLIC_URL': JSON.stringify(''),
    // 部分套件沿用 Node 的 global（webpack 5／CRA 會自動提供），在瀏覽器對應到 globalThis
    global: 'globalThis',
  }
  for (const [k, v] of Object.entries({ ...env, ...pick(process.env, 'REACT_APP_') })) {
    define[`process.env.${k}`] = JSON.stringify(v)
  }
  // 程式中有引用、但未設定的 REACT_APP_ 變數視為 undefined（與 CRA 相同）
  for (const k of ['REACT_APP_API_URL', 'REACT_APP_GA_MEASUREMENT_ID']) {
    if (!(`process.env.${k}` in define)) define[`process.env.${k}`] = 'undefined'
  }
  // 整個 process.env 也比照 CRA（DefinePlugin）替換成完整物件：src/components/Page.js 以解構讀取 NODE_ENV、REACT_APP_GA_MEASUREMENT_ID，
  // 只定義個別成員時解構會拿到 undefined（正式站 GA 頁面瀏覽事件就不會送出）
  const fullEnv = {}
  for (const [key, value] of Object.entries(define)) {
    if (key.startsWith('process.env.') && value !== 'undefined') fullEnv[key.slice('process.env.'.length)] = JSON.parse(value)
  }
  define['process.env'] = JSON.stringify(fullEnv)

  return {
    plugins: [react({ include: /\.(js|jsx)$/ })],
    define,
    resolve: {
      alias: srcRoots.map(name => ({ find: new RegExp(`^${name}(?=/|$)`), replacement: path.join(src, name) })),
    },
    // Sass 改用 modern compiler（CRA 的 sass-loader 用舊 API，編譯結果相同；避免 legacy-js-api 棄用警告）
    css: { preprocessorOptions: { scss: { api: 'modern-compiler', silenceDeprecations: ['import'] } } },
    esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' }, define: { global: 'globalThis' } } },
    server: { port: 3000, open: false },
    preview: { port: 3000 },
    build: {
      outDir: process.env.BUILD_PATH || 'build',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 4096,
    },
  }
})

function pick(obj, prefix) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => k.startsWith(prefix)))
}
