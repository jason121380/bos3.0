import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { TextField, InputAdornment, Input, OutlinedInput } from '../text-field'

afterEach(cleanup)

describe('ui/text-field TextField（與 MUI TextField 相容的介面）', () => {
  // STYLE「標籤在上」：label 渲染在欄位上方，並與輸入框關聯；required 加星號
  it('label 成為上方標籤並關聯輸入框，required 顯示星號', () => {
    render(<TextField label="名稱" required value="" onChange={() => {}} />)
    expect(screen.getByLabelText(/名稱/)).toBe(screen.getByRole('textbox'))
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  // 頁面只換 import：onChange 收到原生事件，event.target.value 為輸入值
  it('onChange 收到 event.target.value', () => {
    // 受控欄位在事件後會被 React 還原，須在處理函式當下讀值（與頁面寫法相同）
    const seen = []
    render(<TextField value="" onChange={event => seen.push(event.target.value)} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '王小明' } })
    expect(seen).toEqual(['王小明'])
  })

  // 帳單與會計表單以 inputRef 串接 Enter 跳欄
  it('inputRef 取得實際輸入框，可程式聚焦', () => {
    const inputRef = React.createRef()
    render(<TextField inputRef={inputRef} value="" onChange={() => {}} />)
    expect(inputRef.current).toBe(screen.getByRole('textbox'))
  })

  // MUI 把 onKeyDown 放在外層根節點，鍵盤事件由輸入框冒泡上來
  it('onKeyDown 由輸入框冒泡觸發，event.target 為輸入框', () => {
    const onKeyDown = jest.fn()
    render(<TextField onKeyDown={onKeyDown} value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onKeyDown.mock.calls[0][0].target).toBe(input)
  })

  // InputProps.inputProps 與 inputProps 都要落到輸入元素（Cypress 用 data-testid 找欄位）
  it('InputProps.inputProps 與 inputProps 落在輸入元素上', () => {
    render(
      <TextField
        type="number"
        value={0}
        onChange={() => {}}
        InputProps={{ inputProps: { min: 0 } }}
        inputProps={{ 'data-testid': 'price' }}
      />
    )
    const input = screen.getByTestId('price')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('type', 'number')
  })

  // 前後裝飾（金額單位、清除鈕、載入圈）與輸入框同在一個外框內
  it('startAdornment／endAdornment 與輸入框並排顯示', () => {
    render(
      <TextField
        value=""
        onChange={() => {}}
        InputProps={{
          startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
          endAdornment: <InputAdornment position="end">元</InputAdornment>,
        }}
      />
    )
    expect(screen.getByText('NT$')).toBeInTheDocument()
    expect(screen.getByText('元')).toBeInTheDocument()
  })

  // 驗證錯誤：helperText 顯示並以 aria-describedby 關聯，欄位標記 aria-invalid
  it('error＋helperText 顯示錯誤說明並標記 aria-invalid', () => {
    render(<TextField error helperText="必填" value="" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('必填').id)
  })

  // 備註等多行欄位：multiline 改用 textarea，minRows 為預設列數
  it('multiline 以 textarea 呈現並套用 minRows', () => {
    render(<TextField multiline minRows={3} value="" onChange={() => {}} />)
    const area = screen.getByRole('textbox')
    expect(area.tagName).toBe('TEXTAREA')
    expect(area).toHaveAttribute('rows', '3')
  })
})

describe('ui/text-field Input／OutlinedInput（與 MUI Input／OutlinedInput 相容）', () => {
  // 收支／進貨／儲值頁的日期欄：Input 當日期選擇器的顯示欄，點欄位任何位置（含外框）都要打開日曆
  it('onClick 在外框，id 讓 InputLabel 可關聯、value 顯示在輸入元素', () => {
    const onClick = jest.fn()
    const { container } = render(
      <>
        <label htmlFor="date-picker">日期</label>
        <Input id="date-picker" type="text" value="2026/10/20" onClick={onClick} label="日期" readOnly endAdornment={<InputAdornment position="end">曆</InputAdornment>} />
      </>
    )
    const input = screen.getByLabelText('日期')
    expect(input).toHaveValue('2026/10/20')
    fireEvent.click(input.parentElement)
    fireEvent.click(screen.getByText('曆'))
    expect(onClick).toHaveBeenCalledTimes(2)
    // label 不是 MUI Input 的屬性，不能落到 DOM
    expect(container.querySelector('[label]')).toBeNull()
  })

  // 搜尋列的輸入框：外框由外層畫，disableUnderline 時不能再多一層框；Enter 搜尋靠 onKeyUp／onKeyDown 掛在輸入元素
  it('disableUnderline 為無框輸入，鍵盤事件在輸入元素', () => {
    const onKeyUp = jest.fn()
    render(<Input disableUnderline placeholder="搜尋關鍵字" value="" onChange={() => {}} onKeyUp={onKeyUp} />)
    const input = screen.getByPlaceholderText('搜尋關鍵字')
    expect(input.parentElement.className).not.toMatch(/border-border-strong/)
    fireEvent.keyUp(input, { key: 'Enter' })
    expect(onKeyUp.mock.calls[0][0].target).toBe(input)
  })

  it('OutlinedInput 的 error 以 aria-invalid 與紅框呈現', () => {
    render(<OutlinedInput id="password" type="password" value="x" onChange={() => {}} error fullWidth />)
    const input = document.getElementById('password')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.parentElement).toHaveClass('border-danger', 'w-full')
  })
})
