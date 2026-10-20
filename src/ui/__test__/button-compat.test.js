import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Button } from '../button-compat'

afterEach(cleanup)

describe('ui/button-compat（與 MUI Button 相容）', () => {
  // 主要動作（contained primary）必須是品牌藍實心，刪除類（contained error）必須是紅色——使用者靠顏色辨認風險
  it('variant × color 對應到 ui/button 的變體', () => {
    render(
      <>
        <Button variant="contained" color="primary">送出</Button>
        <Button variant="contained" color="error">刪除</Button>
        <Button variant="outlined">取消</Button>
        <Button>文字鈕</Button>
      </>
    )
    expect(screen.getByText('送出')).toHaveClass('bg-primary')
    expect(screen.getByText('刪除')).toHaveClass('bg-danger')
    expect(screen.getByText('取消')).toHaveClass('bg-surface-hover')
    expect(screen.getByText('文字鈕')).not.toHaveClass('bg-primary', 'bg-surface-hover')
  })

  // MUI 按鈕預設 type="button"：放在表單內不可意外送出表單（帳單彈窗內大量按鈕）
  it('預設 type="button"，type="submit" 照傳', () => {
    const onSubmit = jest.fn(e => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Button>一般</Button>
        <Button type="submit">送出</Button>
      </form>
    )
    fireEvent.click(screen.getByText('一般'))
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('送出'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  // disabled、ref（打帳單以 ref 聚焦結帳鈕）、style 都要保留
  it('disabled、ref、style 落在 button', () => {
    const ref = React.createRef()
    render(
      <Button ref={ref} disabled style={{ margin: 3 }} focusRipple>
        結帳
      </Button>
    )
    expect(ref.current).toBe(screen.getByText('結帳'))
    expect(ref.current).toBeDisabled()
    expect(ref.current.style.margin).toBe('3px')
    expect(ref.current).not.toHaveAttribute('focusRipple')
  })
})
