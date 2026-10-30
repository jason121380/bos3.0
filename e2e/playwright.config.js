// 畫面掃描（npm run test:e2e）：對 vite build 的靜態檔＋假 GraphQL 走訪所有後台路由。
// 不連任何真實後端：測試內 page.route 只放行本機，GraphQL 回假資料，其餘一律 abort；
// 另以 host-resolver-rules 讓 WebSocket 等 page.route 攔不到的連線也解析失敗（CLAUDE.md 鐵則 5）。
const { defineConfig } = require('@playwright/test')

const PORT = Number(process.env.E2E_PORT || 4173)

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: /.*\.spec\.js$/,
  fullyParallel: true,
  workers: process.env.CI ? 4 : 6,
  timeout: 45000,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'e2e-results/results.json' }]],
  outputDir: 'e2e-results/artifacts',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    timezoneId: 'Asia/Taipei',
    locale: 'zh-TW',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        '--host-resolver-rules=MAP *.run.app ~NOTFOUND, MAP *beautyos* ~NOTFOUND, MAP *crt-test* ~NOTFOUND, MAP *mlgroup* ~NOTFOUND, MAP *lure.com.tw ~NOTFOUND',
      ],
    },
  },
  webServer: {
    command: 'node static-server.js',
    cwd: __dirname,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
