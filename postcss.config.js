// Vite 透過 PostCSS 處理 Tailwind（CRA 5 原本自動偵測 tailwind.config.js 並內建 autoprefixer）
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
