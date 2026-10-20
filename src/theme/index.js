import palette from './palette'
import typography from './typography'

// 全站舊樣式用的主題物件（emotion css 裡的 theme.spacing／breakpoints／typography／palette／shadows）。
// 原本以 MUI createTheme 產生；MUI 移除後改為純物件，數值與函式行為與 createTheme 結果逐值相同（2026/10/20，見 MEMORY #151）：
// - spacing(n…)：每單位 8px，多參數以空白相接（spacing(0, 1) → '0px 8px'），字串原樣（'auto'）
// - breakpoints：sm 600、md 900、lg 1200、xl 1536（MUI 斷點，與 Tailwind 不同）；down 以 0.05px 收尾
// - typography：h1～h6、subtitle1／2 為 typography.js 與 MUI 預設合併後的結果；pxToRem 以 html 16px 換算
// - shadows：MUI 預設 25 級陰影

const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }
const bp = key => (typeof key === 'number' ? key : BREAKPOINTS[key])

const spacing = (...args) => (args.length ? args : [1]).map(v => (typeof v === 'number' ? `${v * 8}px` : v)).join(' ')

const breakpoints = {
  values: BREAKPOINTS,
  up: key => `@media (min-width:${bp(key)}px)`,
  down: key => `@media (max-width:${bp(key) - 0.05}px)`,
}

const { fontFamily } = typography

export const theme = {
  palette: { ...palette, common: { black: '#000', white: '#fff' } },
  typography: {
    fontFamily,
    fontSize: 14,
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    pxToRem: px => `${px / 16}rem`,
    h1: { color: '#000000', fontWeight: 700, fontSize: '34px', letterSpacing: '0.37px', lineHeight: '41px', fontFamily },
    h2: { color: '#000000', fontWeight: 700, fontSize: '24px', letterSpacing: '0.35px', lineHeight: '30px', fontFamily },
    h3: { color: '#000000', fontWeight: 700, fontSize: '20px', letterSpacing: '0.38px', lineHeight: '26px', fontFamily },
    h4: { color: '#000000', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.24px', lineHeight: '24px', fontFamily },
    h5: { color: '#000000', fontWeight: 600, fontSize: '16px', letterSpacing: '-0.41px', lineHeight: '22px', fontFamily },
    h6: { color: '#000000', fontWeight: 600, fontSize: '14px', letterSpacing: '-0.24px', lineHeight: '20px', fontFamily },
    subtitle1: { color: '#000000', fontSize: '15px', fontWeight: 500, letterSpacing: '-0.24px', lineHeight: '20px', fontFamily },
    subtitle2: { color: '#3C3C43', fontWeight: 500, fontSize: '13px', letterSpacing: '-0.1px', lineHeight: '18px', fontFamily },
  },
  spacing,
  breakpoints,
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)',
  ],
}
