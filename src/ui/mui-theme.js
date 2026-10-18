import React, { useMemo } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import legacyTypography from 'theme/typography'

// 遷移期的 MUI 橋接主題：已改版頁面中「尚未換成 src/ui」的 MUI 元件（Autocomplete、日期選擇、Accordion…）
// 透過這個主題套上 STYLE.md 的外觀，不需改動它們的 JSX 與邏輯。
// MUI 需要實際色碼計算透明度，因此色碼集中在這裡，數值與 src/styles/tokens.css 一一對應；其他檔案仍禁止寫死色碼。
const TOKENS = {
  light: {
    canvas: '#F7F7F8', background: '#FFFFFF', surface: '#F2F2F3', surfaceHover: '#E9E9EB', surfaceActive: '#DEDEE1',
    border: '#E5E5E5', borderStrong: '#C2C2C2', borderStrongHover: '#949494',
    text: '#0D0D0D', textSecondary: '#5D5D5D', textTertiary: '#8F8F8F',
    primary: '#1A73E8', primaryForeground: '#FFFFFF', accent: '#1A73E8',
    success: '#10A37F', warning: '#B7791F', danger: '#D92D20',
  },
  dark: {
    canvas: '#0A0A0A', background: '#171717', surface: '#1C1C1C', surfaceHover: '#262626', surfaceActive: '#323232',
    border: '#2E2E2E', borderStrong: '#484848', borderStrongHover: '#6E6E6E',
    text: '#ECECEC', textSecondary: '#B4B4B4', textTertiary: '#8F8F8F',
    primary: '#1A73E8', primaryForeground: '#FFFFFF', accent: '#4C8DF6',
    success: '#19C37D', warning: '#F0B429', danger: '#F97066',
  },
}

const FLOAT_SHADOW = '0 4px 16px rgba(0,0,0,0.08)'
const SHEET = '@media (max-width: 639.95px)'

export function createBridgeTheme(mode = 'light') {
  const t = TOKENS[mode]
  return createTheme({
    palette: {
      mode,
      primary: { main: t.primary, contrastText: t.primaryForeground },
      // 沿用舊版語意：secondary 為中性灰（舊版 #8E8E93），不是第二個強調色
      secondary: { main: t.textSecondary, contrastText: '#FFFFFF' },
      success: { main: t.success },
      warning: { main: t.warning },
      error: { main: t.danger },
      text: { primary: t.text, secondary: t.textSecondary, disabled: t.textTertiary },
      divider: t.border,
      background: { default: t.canvas, paper: t.background },
      action: { hover: t.surfaceHover, selected: t.surfaceHover },
    },
    shape: { borderRadius: 8 },
    // 字級對應 STYLE.md §3：舊頁面的 h1–h6、body、overline 等變體統一到新字級（不使用全大寫）
    typography: {
      ...legacyTypography,
      fontFamily: ['Roboto', '"Noto Sans TC"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      fontSize: 14,
      h1: { fontSize: 28, lineHeight: '36px', fontWeight: 700, letterSpacing: 0, color: t.text },
      h2: { fontSize: 24, lineHeight: '32px', fontWeight: 700, letterSpacing: 0, color: t.text },
      h3: { fontSize: 20, lineHeight: '28px', fontWeight: 700, letterSpacing: 0, color: t.text },
      h4: { fontSize: 18, lineHeight: '26px', fontWeight: 700, letterSpacing: 0, color: t.text },
      h5: { fontSize: 16, lineHeight: '24px', fontWeight: 700, letterSpacing: 0, color: t.text },
      h6: { fontSize: 15, lineHeight: '22px', fontWeight: 700, letterSpacing: 0, color: t.text },
      subtitle1: { fontSize: 14, lineHeight: '20px', fontWeight: 500, letterSpacing: 0, color: t.text },
      subtitle2: { fontSize: 13, lineHeight: '18px', fontWeight: 500, letterSpacing: 0, color: t.textSecondary },
      body1: { fontSize: 14, lineHeight: '20px', letterSpacing: 0, color: t.text },
      body2: { fontSize: 13, lineHeight: '20px', letterSpacing: 0, color: t.textSecondary },
      caption: { fontSize: 12, lineHeight: '16px', letterSpacing: 0, color: t.textSecondary },
      overline: { fontSize: 12, lineHeight: '16px', fontWeight: 500, letterSpacing: 0, textTransform: 'none', color: t.textSecondary },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    components: {
      // 日期選擇器：頂部用主題藍底白字（主題色點綴），選取日與確認按鈕用主題色（取代舊版灰色頂欄）
      MuiPickersToolbar: {
        styleOverrides: {
          root: {
            backgroundColor: `${t.primary} !important`,
            '& *': { color: '#FFFFFF !important' },
            '& span:not(.Mui-selected)': { opacity: 0.75 },
            '& .MuiDateTimePickerToolbar-dateContainer button, & .MuiDateTimePickerToolbar-timeContainer button': { display: 'flex' },
            '& .MuiDateTimePickerToolbar-timeDigitsContainer': { display: 'flex', alignItems: 'center', '& span': { fontSize: 30 } },
            '& .MuiPickersToolbar-content': { marginTop: 8 },
          },
        },
      },
      MuiPickersLayout: {
        styleOverrides: {
          root: {
            padding: 0,
            overflow: 'hidden',
            '& .MuiPickersLayout-header': { width: '100%' },
            '& .MuiDialogActions-root button': { color: t.accent, fontWeight: 500 },
          },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          root: {
            '& .MuiDayCalendar-weekDayLabel': { fontSize: 12, margin: '0px 2px', color: t.textTertiary },
            '& .MuiPickersDay-root': { fontSize: 12, margin: '0px 2px', borderRadius: '50%' },
          },
        },
      },
      MuiPickersDay: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { backgroundColor: `${t.accent} !important`, color: '#FFFFFF !important' },
            '&.MuiPickersDay-today': { borderColor: `${t.accent} !important` },
          },
        },
      },
      MuiPickersCalendarHeader: { styleOverrides: { switchViewButton: { color: t.textSecondary } } },
      MuiPickersArrowSwitcher: { styleOverrides: { button: { color: t.textSecondary } } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 9999, minHeight: 36, padding: '0 16px', boxShadow: 'none' },
          sizeSmall: { minHeight: 32, padding: '0 12px', fontSize: 13 },
          // 舊版語意：預設（primary）實心＝主要按鈕（主題藍）；inherit / secondary 實心＝次要按鈕（淺灰實心）
          containedInherit: { backgroundColor: t.surfaceHover, color: t.text, '&:hover': { backgroundColor: t.surfaceActive } },
          containedSecondary: { backgroundColor: t.surfaceHover, color: t.text, '&:hover': { backgroundColor: t.surfaceActive } },
          outlined: { border: 'none', backgroundColor: t.surfaceHover, color: t.text, '&:hover': { border: 'none', backgroundColor: t.surfaceActive } },
          text: { color: t.text, borderRadius: 8, '&:hover': { backgroundColor: t.surfaceHover } },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 8, color: t.textSecondary, '&:hover': { backgroundColor: t.surfaceHover } } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: t.background,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrongHover },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: t.accent, borderWidth: 1 },
            '&.Mui-focused': { boxShadow: `0 0 0 2px ${t.accent}40` },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: t.danger },
            '&.Mui-disabled': { backgroundColor: t.surface },
          },
          // STYLE.md：輸入框一律 36px（含 MUI 預設 medium 尺寸）；多行輸入只調內距
          input: { fontSize: 14, padding: '8px 12px', height: 20, lineHeight: '20px' },
          inputSizeSmall: { padding: '8px 12px' },
          multiline: { padding: '8px 12px' },
          inputMultiline: { padding: 0, height: 'auto' },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: 14,
            color: t.textSecondary,
            '&.Mui-focused': { color: t.accent },
            // 配合 36px 輸入框，未浮起的標籤垂直置中
            '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': { transform: 'translate(12px, 8px) scale(1)' },
          },
        },
      },
      MuiFormHelperText: { styleOverrides: { root: { fontSize: 12, marginLeft: 0 } } },
      MuiFormControlLabel: { styleOverrides: { label: { fontSize: 14, color: t.text } } },
      MuiCheckbox: { styleOverrides: { root: { color: t.borderStrongHover, '&.Mui-checked': { color: t.primary } } } },
      MuiRadio: { styleOverrides: { root: { color: t.textTertiary, '&.Mui-checked': { color: t.primary } } } },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { '&.Mui-checked': { color: '#FFFFFF' }, '&.Mui-checked + .MuiSwitch-track': { backgroundColor: t.accent, opacity: 1 } },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: { root: { backgroundColor: t.surfaceHover, borderRadius: 9999, padding: 2, gap: 2 } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: 'none !important',
            borderRadius: '9999px !important',
            padding: '0 14px',
            minHeight: 30,
            fontSize: 14,
            fontWeight: 500,
            color: t.textSecondary,
            '&.Mui-selected': { backgroundColor: t.background, color: t.accent, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' },
            '&.Mui-selected:hover': { backgroundColor: t.background },
          },
        },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true, square: true },
        styleOverrides: {
          root: {
            border: `1px solid ${t.border}`,
            borderRadius: '12px !important',
            boxShadow: 'none',
            overflow: 'hidden',
            '&:before': { display: 'none' },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: { minHeight: 52, padding: '0 20px', '&:hover': { backgroundColor: t.surface } },
          content: { margin: '14px 0', alignItems: 'center' },
          expandIconWrapper: { color: t.textTertiary },
        },
      },
      MuiAccordionDetails: { styleOverrides: { root: { padding: '4px 20px 20px' } } },
      MuiCard: { styleOverrides: { root: { border: `1px solid ${t.border}`, borderRadius: 12, boxShadow: 'none' } } },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: '16px 20px' },
          title: { fontSize: 16, lineHeight: '24px', fontWeight: 700, color: t.text },
          subheader: { fontSize: 13, color: t.textSecondary },
        },
      },
      MuiCardContent: { styleOverrides: { root: { padding: '16px 20px', '&:last-child': { paddingBottom: 20 } } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: FLOAT_SHADOW },
          // 手機（< 640px，與 Tailwind sm 一致）：非全螢幕的對話框改為底部面板
          container: { [SHEET]: { alignItems: 'flex-end' } },
          root: {
            [SHEET]: {
              '& .MuiDialog-paper:not(.MuiDialog-paperFullScreen)': {
                margin: 0,
                width: '100%',
                maxWidth: '100%',
                maxHeight: 'calc(100% - 48px)',
                borderRadius: '16px 16px 0 0',
                borderBottom: 0,
                paddingBottom: 'env(safe-area-inset-bottom)',
                animation: 'ui-sheet-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              },
            },
          },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontSize: 16, fontWeight: 700, padding: '20px 24px 8px' } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px', gap: 8 } } },
      MuiPopover: {
        styleOverrides: { paper: { borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: FLOAT_SHADOW } },
      },
      MuiMenu: { styleOverrides: { paper: { borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: FLOAT_SHADOW } } },
      MuiMenuItem: { styleOverrides: { root: { fontSize: 14, minHeight: 36, borderRadius: 8, margin: '0 4px' } } },
      MuiAutocomplete: {
        styleOverrides: {
          paper: { borderRadius: 12, border: `1px solid ${t.border}`, boxShadow: FLOAT_SHADOW, marginTop: 4 },
          inputRoot: {
            '&.MuiOutlinedInput-root': { paddingTop: 0, paddingBottom: 0, paddingLeft: 8 },
            '& .MuiAutocomplete-input': { padding: '8px 4px !important' },
          },
          option: { fontSize: 14, minHeight: '36px !important' },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 8, fontSize: 13 } } },
      MuiTableCell: {
        styleOverrides: {
          // 手機螢幕：儲存格不換行、表格改橫向捲動（與 ui/table 一致）；只限螢幕，不影響列印
          root: { borderColor: t.border, fontSize: 14, '@media screen and (max-width: 639.95px)': { whiteSpace: 'nowrap' } },
          head: { backgroundColor: t.surface, color: t.textSecondary, fontSize: 13, fontWeight: 500 },
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontSize: 14, minHeight: 40, color: t.textSecondary, '&.Mui-selected': { color: t.accent, fontWeight: 500 } } } },
      MuiTabs: { styleOverrides: { indicator: { backgroundColor: t.accent, height: 2 } } },
      MuiDivider: { styleOverrides: { root: { borderColor: t.border } } },
      MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: t.text, color: t.background, fontSize: 12, borderRadius: 8 } } },
    },
  })
}

// 包住已改版頁面；深色模式跟隨 <html class="dark">（由 NavBar 依使用者主題設定）
export function MuiScope({ children }) {
  const dark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const theme = useMemo(() => createBridgeTheme(dark ? 'dark' : 'light'), [dark])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

// 讓單一共用元件（如篩選列）在舊頁面中也套用橋接主題，不需改動元件本身
export function withMuiScope(Component) {
  const Scoped = React.forwardRef((props, ref) => (
    <MuiScope>
      <Component {...props} ref={ref} />
    </MuiScope>
  ))
  Scoped.displayName = `withMuiScope(${Component.displayName || Component.name || 'Component'})`
  return Scoped
}
