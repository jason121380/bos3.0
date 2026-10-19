// Tailwind 設定：依 STYLE.md。遷移期關閉 preflight，與 MUI 並存。
const token = name => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  // 舊頁面已有同名 className（EventRuleCreate 的 container、Line/map 的 my-4），封鎖以免改到舊畫面
  blocklist: ['container', 'my-4'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        background: token('background'),
        surface: { DEFAULT: token('surface'), hover: token('surface-hover'), active: token('surface-active') },
        border: { DEFAULT: token('border'), strong: token('border-strong'), 'strong-hover': token('border-strong-hover') },
        text: {
          DEFAULT: token('text'),
          secondary: token('text-secondary'),
          tertiary: token('text-tertiary'),
        },
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        accent: token('accent'),
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
      },
      borderColor: { DEFAULT: token('border') },
      opacity: { 8: '0.08' },
      borderRadius: { md: '8px', lg: '12px' },
      boxShadow: { float: '0 4px 16px rgba(0,0,0,0.08)', card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.05)' }, // card：PrimeStay 式柔和卡片陰影（STYLE §13），僅外框／Card 用，報表 compact 不加
      fontFamily: {
        // 與全站既有字型一致（src/assets/scss/main.scss 以 !important 套用在所有元素）
        sans: ['Roboto', '"Noto Sans TC"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['28px', { lineHeight: '36px', fontWeight: '700' }],
        title: ['20px', { lineHeight: '28px', fontWeight: '700' }],
        heading: ['16px', { lineHeight: '24px', fontWeight: '700' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        label: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
