import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TextField } from '../standard-input-compat'

afterEach(cleanup)

describe('ui/standard-input-compat（薪資轉帳單的底線輸入框）', () => {
  // 列印範本 initialize.scss 以 .MerchantBankTransferReportTransferDetail .MuiInput-underline／input 排版（底線色、文字置中），class 必須與 MUI 相同
  it('輸出 MUI standard TextField 的 DOM 與 class，style 落在根節點', () => {
    const { container } = render(<TextField variant="standard" size="small" style={{ width: 60 }} defaultValue="2026" />)
    const root = container.firstChild
    expect(root).toHaveClass('MuiFormControl-root', 'MuiTextField-root')
    expect(root.style.width).toBe('60px')
    expect(root.firstChild).toHaveClass('MuiInputBase-root', 'MuiInput-root', 'MuiInput-underline', 'MuiInputBase-sizeSmall')
    expect(screen.getByRole('textbox')).toHaveClass('MuiInputBase-input', 'MuiInput-input', 'MuiInputBase-inputSizeSmall')
    expect(screen.getByRole('textbox')).toHaveValue('2026')
  })

  // 使用者在列印前可修改年月日：聚焦時標示 Mui-focused（底線變色）
  it('可輸入，聚焦時外框標示 Mui-focused', () => {
    render(<TextField variant="standard" size="small" defaultValue="10" />)
    const input = screen.getByRole('textbox')
    act(() => input.focus())
    expect(input.parentElement).toHaveClass('Mui-focused')
    fireEvent.change(input, { target: { value: '11' } })
    expect(input).toHaveValue('11')
    act(() => input.blur())
    expect(input.parentElement).not.toHaveClass('Mui-focused')
  })
})
