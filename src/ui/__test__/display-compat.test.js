import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { Paper, Divider, CircularProgress, Typography, Container } from '../display-compat'

afterEach(cleanup)

describe('ui/display-compat（與 MUI Paper／Divider／CircularProgress／Typography／Container 相容）', () => {
  // 報表表格以 <TableContainer component={Paper}> 包住；initialize.scss 的列印規則以 .MuiPaper-root 去框去圓角
  it('Paper 預設 elevation 0（橋接主題）、輸出 MUI class', () => {
    render(<Paper data-testid="p" />)
    expect(screen.getByTestId('p')).toHaveClass('MuiPaper-root', 'MuiPaper-elevation0', 'MuiPaper-rounded')
  })

  // Typography 的元素對應決定文件結構（h1～h6 標題層級、body 為段落），報讀器與列印都依賴
  it('Typography 依 variant 對應元素，component 可覆寫', () => {
    render(
      <>
        <Typography variant="h3">標題</Typography>
        <Typography variant="body2">段落</Typography>
        <Typography variant="overline">小字</Typography>
        <Typography variant="h4" component="div" gutterBottom align="center">
          無資料
        </Typography>
      </>
    )
    expect(screen.getByText('標題').tagName).toBe('H3')
    expect(screen.getByText('段落').tagName).toBe('P')
    expect(screen.getByText('小字').tagName).toBe('SPAN')
    const div = screen.getByText('無資料')
    expect(div.tagName).toBe('DIV')
    expect(div).toHaveClass('MuiTypography-h4', 'MuiTypography-gutterBottom', 'MuiTypography-alignCenter')
  })

  // 上傳進度：定值圓環要讓報讀器讀到目前百分比
  it('CircularProgress 定值帶 aria-valuenow，不定值轉圈尺寸照 size', () => {
    render(
      <>
        <CircularProgress variant="determinate" value={42} data-testid="d" />
        <CircularProgress color="inherit" size={20} data-testid="i" />
      </>
    )
    expect(screen.getByTestId('d')).toHaveAttribute('aria-valuenow', '42')
    expect(screen.getByTestId('i').style.width).toBe('20px')
    expect(screen.getByTestId('i')).toHaveClass('MuiCircularProgress-indeterminate', 'MuiCircularProgress-colorInherit')
  })

  it('Divider 是 hr、Container 依 maxWidth 輸出 class（false 不限寬）', () => {
    const { container } = render(
      <>
        <Divider />
        <Container maxWidth="md" data-testid="md" />
        <Container maxWidth={false} data-testid="none" />
      </>
    )
    expect(container.querySelector('hr')).toHaveClass('MuiDivider-root')
    expect(screen.getByTestId('md')).toHaveClass('MuiContainer-root', 'MuiContainer-maxWidthMd')
    expect(screen.getByTestId('none').className).not.toMatch(/maxWidth/)
  })
})
