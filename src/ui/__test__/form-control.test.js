import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { FormControl, InputLabel, useFormControl } from '../form-control'
import { Checkbox, FormControlLabel } from '../checkbox'

// 下拉（Select／MultipleSelect／MenuItem）已於 2026/10/30 移除（Jason 核准；單選改 ui/native-select、搜尋與多選改 ui/combobox），
// 這裡只保護留下來的 FormControl／InputLabel 與 checkbox。

afterEach(cleanup)

describe('ui/form-control（FormControl／InputLabel）', () => {
  it('InputLabel 在 FormControl 內自動關聯同一個 id；自訂 htmlFor 優先', () => {
    render(
      <>
        <FormControl fullWidth>
          <InputLabel>抽成類別</InputLabel>
        </FormControl>
        <FormControl>
          <InputLabel htmlFor="own-field">付款方式</InputLabel>
        </FormControl>
      </>
    )
    const auto = screen.getByText('抽成類別')
    expect(auto.getAttribute('for')).toMatch(/^fc-\d+$/)
    expect(auto.closest('div').className).toContain('w-full')
    expect(screen.getByText('付款方式').getAttribute('for')).toBe('own-field')
    expect(screen.getByText('付款方式').closest('div').className).toContain('min-w-[120px]')
  })

  it('InputLabel 不在 FormControl 內時為一般標籤色、沒有星號與 for', () => {
    render(<InputLabel id="lonely">單獨標籤</InputLabel>)
    const label = screen.getByText('單獨標籤')
    expect(label).toHaveAttribute('id', 'lonely')
    expect(label.hasAttribute('for')).toBe(false)
    expect(label.className).toContain('text-text-secondary')
    expect(label.querySelector('.text-danger')).toBeNull()
  })
})

// 排班卡標題：輸入框聚焦時才顯示提示（MyFormHelperText 依 useFormControl().focused）
it('useFormControl().focused 隨子欄位聚焦變化', () => {
  const Hint = () => {
    const { focused } = useFormControl() || {}
    return focused ? <span>提示中</span> : null
  }
  render(
    <FormControl>
      <input aria-label="標題" />
      <Hint />
    </FormControl>
  )
  expect(screen.queryByText('提示中')).toBeNull()
  act(() => screen.getByLabelText('標題').focus())
  expect(screen.getByText('提示中')).toBeInTheDocument()
  act(() => screen.getByLabelText('標題').blur())
  expect(screen.queryByText('提示中')).toBeNull()
})

describe('ui/checkbox（與 MUI Checkbox／FormControlLabel 相容）', () => {
  // MUI 簽名：onChange(event, checked)
  it('Checkbox 以 (event, checked) 呼叫 onChange', () => {
    const onChange = jest.fn()
    render(<Checkbox checked={false} onChange={onChange} color="primary" />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange.mock.calls[0][1]).toBe(true)
  })

  // FormControlLabel 把 checked／onChange／disabled 帶給 control，點文字也能切換
  it('FormControlLabel 把 checked、onChange 帶給 control，點文字可切換', () => {
    const onChange = jest.fn()
    render(<FormControlLabel control={<Checkbox />} label="不限制天數" checked={false} onChange={onChange} />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(screen.getByText('不限制天數'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toBe(true)
  })

  it('FormControlLabel 的 disabled 會停用 control', () => {
    render(<FormControlLabel control={<Checkbox />} label="鎖定" disabled checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
})
