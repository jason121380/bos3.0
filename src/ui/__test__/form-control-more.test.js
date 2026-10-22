import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { FormControl, FormHelperText, InputLabel, MenuItem, Select, useFormControl } from '../form-control'

// 保護什麼：MUI 相容的 FormControl／Select（ui/form-control）在 form-control.test.js 以外的情境：
// - FormControl 的 error／required／disabled／size 傳到 InputLabel、Select、FormHelperText（舊頁面只在 FormControl 上設一次）。
// - 非受控模式（只給 defaultValue）要自己記住選取值；沒有 onChange 也能操作。
// - readOnly 擋住鍵盤改值但保留 Enter／Tab（Enter 跳欄）；ref 交給 inputRef 與 inputProps.ref。
// - multiple：非受控、點外面關閉、停用選項不可選、沒有 renderValue 時以選項文字逗號串接。

afterEach(cleanup)

describe('FormControl 的狀態傳遞', () => {
  it('error／required 讓標籤轉紅加星號；FormHelperText 跟隨 error，也可自行覆寫', () => {
    render(
      <FormControl error required>
        <InputLabel>付款方式</InputLabel>
        <Select value="" onChange={() => {}}>
          <MenuItem value="cash">現金</MenuItem>
        </Select>
        <FormHelperText>必填</FormHelperText>
        <FormHelperText error={false}>補充說明</FormHelperText>
      </FormControl>
    )
    const label = screen.getByText('付款方式')
    expect(label.className).toContain('text-danger')
    expect(label.querySelector('.text-danger').textContent).toBe(' *')
    const select = screen.getByLabelText(/付款方式/)
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select.className).toContain('border-danger')
    expect(screen.getByText('必填').className).toContain('text-danger')
    expect(screen.getByText('補充說明').className).toContain('text-text-tertiary')
  })

  it('disabled／size=small 由 FormControl 傳給 Select；Select 自己的 disabled／error 優先', () => {
    const { rerender } = render(
      <FormControl disabled size="small">
        <Select value="cash" onChange={() => {}} inputProps={{ 'aria-label': 's' }}>
          <MenuItem value="cash">現金</MenuItem>
        </Select>
      </FormControl>
    )
    expect(screen.getByLabelText('s')).toBeDisabled()
    expect(screen.getByLabelText('s').className).toContain('h-8')
    rerender(
      <FormControl disabled error>
        <Select value="cash" disabled={false} error={false} onChange={() => {}} inputProps={{ 'aria-label': 's' }}>
          <MenuItem value="cash">現金</MenuItem>
        </Select>
      </FormControl>
    )
    expect(screen.getByLabelText('s')).not.toBeDisabled()
    expect(screen.getByLabelText('s')).not.toHaveAttribute('aria-invalid')
  })

  it('不在 FormControl 內時 FormHelperText 為一般說明色，useFormControl 回傳 undefined', () => {
    let ctx = 'unset'
    const Probe = () => {
      ctx = useFormControl()
      return null
    }
    render(
      <>
        <FormHelperText>說明</FormHelperText>
        <Probe />
      </>
    )
    expect(screen.getByText('說明').className).toContain('text-text-tertiary')
    expect(ctx).toBeUndefined()
  })
})

describe('Select（單選）', () => {
  it('選項文字從巢狀節點與 Fragment 內收集，略過非元素子節點；MenuItem 單獨渲染不輸出內容', () => {
    const { container } = render(
      <Select value={2} onChange={() => {}} inputProps={{ 'aria-label': 's' }}>
        {null}
        <>
          <MenuItem value={1}>
            {'A'}
            <b>店</b>
            {false}
          </MenuItem>
          <MenuItem value={2}>{['B', 2]}</MenuItem>
        </>
        <MenuItem value={3}>{() => '函式'}</MenuItem>
      </Select>
    )
    expect(Array.from(container.querySelectorAll('option')).map(o => o.textContent)).toEqual(['A店', 'B2', ''])
    expect(screen.getByLabelText('s')).toHaveValue('1')
    cleanup()
    const { container: c2 } = render(<MenuItem value="x">x</MenuItem>)
    expect(c2.innerHTML).toBe('')
  })

  it('非受控（defaultValue）時自己記住選取值；沒有 onChange 不拋錯', () => {
    render(
      <Select defaultValue="b" inputProps={{ 'aria-label': 's' }}>
        <MenuItem value="a">甲</MenuItem>
        <MenuItem value="b">乙</MenuItem>
      </Select>
    )
    const select = screen.getByLabelText('s')
    expect(select).toHaveValue('1')
    fireEvent.change(select, { target: { value: '0' } })
    expect(select).toHaveValue('0')
  })

  it('沒有 defaultValue 時為空，值對不到選項時顯示隱藏的空白選項', () => {
    const { container } = render(
      <Select inputProps={{ 'aria-label': 's' }}>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    expect(screen.getByLabelText('s')).toHaveValue('')
    expect(container.querySelector('option[hidden]')).not.toBeNull()
    expect(screen.getByLabelText('s').className).toContain('text-text-tertiary')
  })

  it('onChange 第二參數帶選項 props（MUI child）；索引對不到選項時值為空字串、child 為 undefined', () => {
    const onChange = jest.fn()
    render(
      <Select value="a" onChange={onChange} inputProps={{ 'aria-label': 's' }}>
        <MenuItem value="a" data-x="1">
          甲
        </MenuItem>
      </Select>
    )
    const select = screen.getByLabelText('s')
    fireEvent.change(select, { target: { value: '0' } })
    expect(onChange.mock.calls[0][1].props['data-x']).toBe('1')
    // 防呆：瀏覽器只會回報存在的選項；若索引對不到（例如選項在事件前被換掉）回傳空字串而不是拋錯
    Object.defineProperty(select, 'value', { configurable: true, get: () => '9' })
    fireEvent.change(select)
    expect(onChange.mock.calls[1][0].target.value).toBe('')
    expect(onChange.mock.calls[1][1]).toBeUndefined()
  })

  it('readOnly：方向鍵等按鍵被擋下，Enter／Tab 保留；onKeyDown 照常收到', () => {
    const onKeyDown = jest.fn()
    const { rerender } = render(
      <Select value="a" readOnly onKeyDown={onKeyDown} inputProps={{ 'aria-label': 's' }}>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    const press = key => {
      const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      screen.getByLabelText('s').dispatchEvent(ev)
      return ev.defaultPrevented
    }
    expect(press('ArrowDown')).toBe(true)
    expect(press('Enter')).toBe(false)
    expect(press('Tab')).toBe(false)
    expect(onKeyDown).toHaveBeenCalledTimes(3)
    expect(screen.getByLabelText('s')).toHaveAttribute('aria-readonly', 'true')
    rerender(
      <Select value="a" inputProps={{ 'aria-label': 's' }}>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    expect(press('ArrowDown')).toBe(false)
  })

  it('ref 可同時交給 inputRef（函式）與 inputProps.ref；inputProps.ref 不落到 DOM 屬性', () => {
    const fnRef = jest.fn()
    const objRef = React.createRef()
    render(
      <Select value="a" onChange={() => {}} inputRef={fnRef} inputProps={{ ref: objRef, 'aria-label': 's' }}>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    const select = screen.getByLabelText('s')
    expect(fnRef).toHaveBeenCalledWith(select)
    expect(objRef.current).toBe(select)
  })
})

describe('Select multiple', () => {
  it('非受控：點選加入、再點移除；沒有 renderValue 時以選項文字逗號串接；值不在選項內時略過文字', () => {
    render(
      <Select multiple defaultValue={['zzz']} name="tags">
        <MenuItem value="a">甲</MenuItem>
        <MenuItem value="b">乙</MenuItem>
      </Select>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('')
    fireEvent.click(button)
    fireEvent.click(screen.getByText('甲'))
    fireEvent.click(screen.getByText('乙'))
    expect(button).toHaveTextContent(', 甲, 乙')
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(button).toHaveTextContent(', 乙')
  })

  it('沒有 defaultValue 時為空陣列；value 不是陣列時視為空；停用選項不可選', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <Select multiple>
        <MenuItem value="a">甲</MenuItem>
      </Select>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false')
    rerender(
      <Select multiple value="not-array" onChange={onChange}>
        <MenuItem value="a" disabled>
          甲
        </MenuItem>
      </Select>
    )
    const option = screen.getByRole('option')
    expect(option).toHaveAttribute('aria-disabled', 'true')
    expect(option.className).toContain('pointer-events-none')
    fireEvent.click(option)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('點選單外面關閉，點選單裡面不關閉', () => {
    render(
      <div>
        <span>外面</span>
        <Select multiple value={[]} onChange={() => {}}>
          <MenuItem value="a">甲</MenuItem>
        </Select>
      </div>
    )
    fireEvent.click(screen.getByRole('button'))
    fireEvent.mouseDown(screen.getByRole('option'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('外面'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('受控時不自行改值，onChange 收到新陣列', () => {
    const onChange = jest.fn()
    render(
      <Select multiple value={['a']} onChange={onChange}>
        <MenuItem value="a">甲</MenuItem>
        <MenuItem value="b">乙</MenuItem>
      </Select>
    )
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getAllByRole('option')[0])
    expect(onChange.mock.calls[0][0].target.value).toEqual([])
    expect(screen.getByRole('button')).toHaveTextContent('甲')
  })
})
