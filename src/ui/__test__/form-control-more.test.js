import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { FormControl, FormHelperText, InputLabel, useFormControl } from '../form-control'

// 保護什麼：FormControl 的 error／required／disabled／size 傳到 InputLabel、FormHelperText 與 useFormControl
// （舊頁面只在 FormControl 上設一次）。下拉（Select／MultipleSelect／MenuItem）已於 2026/10/30 移除（Jason 核准），
// 單選看 native-select.test.js、搜尋與多選看 combobox 的測試。

afterEach(cleanup)

describe('FormControl 的狀態傳遞', () => {
  it('error／required 讓標籤轉紅加星號；FormHelperText 跟隨 error，也可自行覆寫', () => {
    render(
      <FormControl error required>
        <InputLabel>付款方式</InputLabel>
        <FormHelperText>必填</FormHelperText>
        <FormHelperText error={false}>補充說明</FormHelperText>
      </FormControl>
    )
    const label = screen.getByText('付款方式')
    expect(label.className).toContain('text-danger')
    expect(label.querySelector('.text-danger').textContent).toBe(' *')
    expect(screen.getByText('必填').className).toContain('text-danger')
    expect(screen.getByText('補充說明').className).toContain('text-text-tertiary')
  })

  it('disabled／size 由 useFormControl 讀得到；未設時為預設值', () => {
    const seen = []
    const Probe = () => {
      const { disabled, size, error, required, focused } = useFormControl()
      seen.push({ disabled, size, error, required, focused })
      return null
    }
    render(
      <>
        <FormControl disabled size="small">
          <Probe />
        </FormControl>
        <FormControl>
          <Probe />
        </FormControl>
      </>
    )
    expect(seen).toEqual([
      { disabled: true, size: 'small', error: false, required: false, focused: false },
      { disabled: false, size: undefined, error: false, required: false, focused: false },
    ])
  })

  it('不在 FormControl 內時 FormHelperText 為一般說明色（error 可自行指定），useFormControl 回傳 undefined', () => {
    let ctx = 'unset'
    const Probe = () => {
      ctx = useFormControl()
      return null
    }
    render(
      <>
        <FormHelperText>說明</FormHelperText>
        <FormHelperText error>錯誤說明</FormHelperText>
        <Probe />
      </>
    )
    expect(screen.getByText('說明').className).toContain('text-text-tertiary')
    expect(screen.getByText('錯誤說明').className).toContain('text-danger')
    expect(ctx).toBeUndefined()
  })
})
