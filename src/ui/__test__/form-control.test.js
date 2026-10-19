import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { FormControl, InputLabel, Select, MenuItem, useFormControl } from '../form-control'
import { Checkbox, FormControlLabel } from '../checkbox'

afterEach(cleanup)

const renderSelect = (props = {}) =>
  render(
    <FormControl fullWidth>
      <InputLabel>抽成類別</InputLabel>
      <Select label="抽成類別" name="kind" {...props}>
        <MenuItem value={null}>全部</MenuItem>
        <MenuItem value={1}>指定</MenuItem>
        <MenuItem value="NONE">不指定</MenuItem>
      </Select>
    </FormControl>
  )

describe('ui/form-control（與 MUI FormControl／InputLabel／Select／MenuItem 相容）', () => {
  // InputLabel 成為欄位上方標籤，並與 select 關聯（無障礙與 STYLE「標籤在上」）
  it('InputLabel 關聯到 Select', () => {
    renderSelect({ value: 1, onChange: () => {} })
    expect(screen.getByLabelText('抽成類別').tagName).toBe('SELECT')
  })

  // 頁面沿用 MUI handler：event.target.value 是 MenuItem 的原始值（null、數字、字串都不能被轉成字串）
  it('onChange 的 event.target.value 為原始值，並帶 name', () => {
    const seen = []
    renderSelect({ value: 1, onChange: event => seen.push([event.target.value, event.target.name]) })
    const select = screen.getByLabelText('抽成類別')
    fireEvent.change(select, { target: { value: '0' } })
    fireEvent.change(select, { target: { value: '2' } })
    expect(seen).toEqual([[null, 'kind'], ['NONE', 'kind']])
  })

  // MUI 以字串比對非物件值：value='1' 也要選到值為 1 的選項
  it('value 與選項以字串比對（1 與 "1" 視為相同）', () => {
    renderSelect({ value: '1', onChange: () => {} })
    const select = screen.getByLabelText('抽成類別')
    expect(select.options[select.selectedIndex].textContent).toBe('指定')
  })

  // MUI：值為空且未設 displayEmpty 時顯示空白（新增商品的類別預設 '' 對應 None 選項，不應顯示 None）
  it('值為空字串時欄位顯示空白，displayEmpty 時顯示選項文字', () => {
    const { rerender } = render(
      <Select value="" onChange={() => {}} inputProps={{ 'aria-label': '類別' }}>
        <MenuItem value="">None</MenuItem>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    expect(screen.getByLabelText('類別')).toHaveClass('text-transparent')
    rerender(
      <Select value="" displayEmpty onChange={() => {}} inputProps={{ 'aria-label': '類別' }}>
        <MenuItem value="">None</MenuItem>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    expect(screen.getByLabelText('類別')).not.toHaveClass('text-transparent')
  })

  // readOnly：顯示值但不允許改值（14 處用於鎖定欄位）
  it('readOnly 時改值不會呼叫 onChange', () => {
    const onChange = jest.fn()
    renderSelect({ value: 1, readOnly: true, onChange })
    fireEvent.change(screen.getByLabelText('抽成類別'), { target: { value: '2' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  // inputRef 取得 select 元素，供 Enter 跳欄 focus
  it('inputRef 取得 select 元素', () => {
    const inputRef = React.createRef()
    renderSelect({ value: 1, onChange: () => {}, inputRef })
    expect(inputRef.current).toBe(screen.getByLabelText('抽成類別'))
  })

  // renderValue：載入中以自訂內容顯示（偏好設計師載入轉圈）
  it('renderValue 的內容會顯示出來', () => {
    render(
      <Select value="loading" onChange={() => {}} renderValue={() => <span>載入中圖示</span>}>
        <MenuItem value="loading">Loading...</MenuItem>
      </Select>
    )
    expect(screen.getByText('載入中圖示')).toBeInTheDocument()
  })

  // multiple：點選項切換加入／移除，onChange 收到陣列
  it('multiple 點選選項以陣列呼叫 onChange', () => {
    const seen = []
    render(
      <Select multiple value={['a']} onChange={event => seen.push(event.target.value)} renderValue={v => v.join('+')}>
        <MenuItem value="a">甲</MenuItem>
        <MenuItem value="b">乙</MenuItem>
      </Select>
    )
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText('乙'))
    expect(seen).toEqual([['a', 'b']])
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
