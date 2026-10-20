import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { Grid } from '../grid-compat'

afterEach(cleanup)

describe('ui/grid-compat（與 MUI Grid v1 相容）', () => {
  // 列印版面（如 div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-md-6.MuiGrid-grid-lg-4）與深色模式都靠 MUI class 排版
  it('輸出與 MUI 相同的 class 名稱', () => {
    render(
      <Grid container spacing={3} direction="column" data-testid="c">
        <Grid item xs={12} md={6} lg={4} data-testid="i">
          x
        </Grid>
      </Grid>
    )
    expect(screen.getByTestId('c')).toHaveClass('MuiGrid-root', 'MuiGrid-container', 'MuiGrid-spacing-xs-3', 'MuiGrid-direction-xs-column')
    expect(screen.getByTestId('i')).toHaveClass('MuiGrid-root', 'MuiGrid-item', 'MuiGrid-grid-xs-12', 'MuiGrid-grid-md-6', 'MuiGrid-grid-lg-4')
  })

  // 預設值不產生多餘 class（MUI 也不輸出 direction-xs-row、spacing-xs-0）
  it('預設 direction／spacing／wrap 不輸出 class', () => {
    render(<Grid container data-testid="c" />)
    expect(screen.getByTestId('c').className).not.toMatch(/direction|spacing|wrap/)
  })

  // 設計師業績比較：xs={12 / 組數} 可能不是整數（5 組＝2.4），寬度要與 MUI 相同（20%）
  it('非整數 xs 以 inline 寬度呈現', () => {
    render(<Grid item xs={12 / 5} data-testid="i" />)
    expect(screen.getByTestId('i').style.flexBasis).toBe('20%')
    expect(screen.getByTestId('i').style.maxWidth).toBe('20%')
  })

  // system props 對應成 class（讓頁面的 emotion css 仍能覆蓋，與 MUI 的覆蓋順序相同）
  it('justifyContent／alignItems 對應成 class，className、style、key 照傳', () => {
    render(
      <Grid item justifyContent="flex-end" alignItems="center" className="MerchantDailyReportCard" style={{ marginTop: 24 }} data-testid="i" />
    )
    const el = screen.getByTestId('i')
    expect(el).toHaveClass('justify-end', 'items-center', 'MerchantDailyReportCard')
    expect(el.style.marginTop).toBe('24px')
  })
})
