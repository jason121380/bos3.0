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
        surface: { DEFAULT: token('surface'), hover: token('surface-hover'), active: token('surface-active'), selected: token('surface-selected') },
        border: { DEFAULT: token('border'), strong: token('border-strong'), 'strong-hover': token('border-strong-hover') },
        text: {
          DEFAULT: token('text'),
          secondary: token('text-secondary'),
          tertiary: token('text-tertiary'),
        },
        primary: { DEFAULT: token('primary'), foreground: token('primary-foreground') },
        accent: { DEFAULT: token('accent'), text: token('accent-text') },
        success: token('success'),
        warning: token('warning'),
        danger: token('danger'),
      },
      borderColor: { DEFAULT: token('border') },
      opacity: { 8: '0.08' },
      borderRadius: { md: '8px', lg: '12px' },
      // Grok 式動效：150ms、cubic-bezier(0.22, 1, 0.36, 1)
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      boxShadow: { float: '0 4px 16px rgba(0,0,0,0.08)' },
      fontFamily: {
        // 與全站既有字型一致（src/assets/scss/main.scss 以 !important 套用在所有元素）
        sans: ['Roboto', '"Noto Sans TC"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Grok 式字級（Jason 2026/10/20）：介面內文 16px；表格（含報表 compact）維持 14px（table）
        display: ['28px', { lineHeight: '36px', fontWeight: '500', letterSpacing: '-0.01em' }],
        title: ['24px', { lineHeight: '32px', fontWeight: '400', letterSpacing: '-0.01em' }],
        heading: ['18px', { lineHeight: '26px', fontWeight: '500' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        table: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        label: ['14px', { lineHeight: '20px', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
