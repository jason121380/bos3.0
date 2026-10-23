import { cleanup } from '@testing-library/react'

import { theme } from 'theme'

afterEach(cleanup)

// 全站 emotion 樣式以 theme.spacing／breakpoints 排版（347 處 spacing）；改為純物件後必須與原 MUI createTheme 的輸出逐字相同，
// 否則間距與響應式斷點（MUI 的 600／900，不是 Tailwind 的 640／768）會悄悄改變。期望值取自 MUI createTheme 的實際輸出。
describe('theme（取代 MUI createTheme 的純物件）', () => {
  it('spacing 與 MUI 相同', () => {
    expect(theme.spacing(1)).toBe('8px')
    expect(theme.spacing(0)).toBe('0px')
    expect(theme.spacing(0.5)).toBe('4px')
    expect(theme.spacing(0, 1)).toBe('0px 8px')
    expect(theme.spacing(1, 2, 3, 4)).toBe('8px 16px 24px 32px')
    expect(theme.spacing('auto', 2)).toBe('auto 16px')
  })

  it('breakpoints 與 typography.pxToRem 與 MUI 相同', () => {
    expect(theme.breakpoints.down('sm')).toBe('@media (max-width:599.95px)')
    expect(theme.breakpoints.down('md')).toBe('@media (max-width:899.95px)')
    expect(theme.breakpoints.up('sm')).toBe('@media (min-width:600px)')
    expect(theme.typography.pxToRem(14)).toBe('0.875rem')
    expect(theme.shadows).toHaveLength(25)
    expect(theme.palette.common.white).toBe('#fff')
  })
})
