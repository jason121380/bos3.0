import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'

import { DatePicker, MobileDatePicker, MobileDateTimePicker } from '../date-picker'
import { DateField, parseFormat } from '../date-field'

afterEach(cleanup)

const iso = d => (d instanceof Date && !Number.isNaN(d.getTime()) ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}` : String(d))

// 以滑鼠裝置（pointer: fine）渲染：DatePicker 走分段輸入＋月曆鈕
const withDesktop = fn => {
  const original = window.matchMedia
  window.matchMedia = query => ({
    matches: query === '(pointer: fine)',
    addEventListener() {},
    removeEventListener() {},
  })
  try {
    fn()
  } finally {
    window.matchMedia = original
  }
}

describe('ui/date-picker（取代 @mui/x-date-pickers）', () => {
  // 打卡記錄、預約日期：在彈層點日子立即 onChange（存 Date 原樣），「確認」才 onAccept；各頁 handler 依此存值
  it('手機版：選日子立即 onChange，確認後 onAccept 並關閉', () => {
    const onChange = jest.fn()
    const onAccept = jest.fn()
    render(<MobileDatePicker value={new Date(2026, 9, 20)} onChange={onChange} onAccept={onAccept} />)
    fireEvent.click(screen.getByRole('textbox'))
    const dialog = screen.getByRole('dialog', { name: '選擇日期' })
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月25日' }))
    expect(iso(onChange.mock.calls[0][0])).toBe('2026-10-25 0:0')
    expect(onAccept).not.toHaveBeenCalled()
    const confirm = within(dialog).getByText('確認')
    expect(confirm.className).toContain('h-10')
    expect(confirm.className).toContain('focus-visible:ring-2')
    fireEvent.click(confirm)
    expect(iso(onAccept.mock.calls[0][0])).toBe('2026-10-25 0:0')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  // 使用者按「取消」：還原成開啟時的日期，不可把選到一半的值留在表單上
  it('手機版：取消還原開啟時的值', () => {
    const Harness = () => {
      const [value, setValue] = React.useState(new Date(2026, 9, 20))
      return (
        <>
          <MobileDatePicker value={value} onChange={setValue} />
          <output data-testid="value">{iso(value)}</output>
        </>
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月3日' }))
    expect(screen.getByTestId('value')).toHaveTextContent('2026-10-3 0:0')
    fireEvent.click(screen.getByText('取消'))
    expect(screen.getByTestId('value')).toHaveTextContent('2026-10-20 0:0')
  })

  // 報表的「月份」篩選（views month／year）：選月後跳到選年份，符合 MUI 的視圖順序
  it("views=['month','year'] 選月後跳到年份清單", () => {
    const onChange = jest.fn()
    render(<MobileDatePicker views={['month', 'year']} value={new Date(2026, 9, 1)} onChange={onChange} />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('radio', { name: '3月' }))
    expect(iso(onChange.mock.calls[0][0])).toBe('2026-3-1 0:0')
    expect(screen.getByRole('radiogroup', { name: '選擇年份' })).toBeInTheDocument()
  })

  // 預約時間：選日 → 時 → 分，保留選好的日期；選分鐘後（手機版）仍待確認
  it('手機版日期時間：選日後切到時間，時與分各自更新', () => {
    const onChange = jest.fn()
    const Harness = () => {
      const [value, setValue] = React.useState(new Date(2026, 9, 20, 9, 30))
      return (
        <MobileDateTimePicker
          value={value}
          onChange={next => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('textbox'))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月22日' }))
    fireEvent.click(within(screen.getByRole('listbox', { name: '時' })).getByText('14'))
    fireEvent.click(within(screen.getByRole('listbox', { name: '分' })).getByText('45'))
    expect(onChange.mock.calls.map(c => iso(c[0]))).toEqual(['2026-10-22 9:30', '2026-10-22 14:30', '2026-10-22 14:45'])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  // 生日等欄位 disableFuture：未來日子停用，onError 回傳 MUI 同名代碼（各頁依代碼顯示錯誤）
  it('disableFuture 時未來日期停用且 onError 為 disableFuture', () => {
    const onError = jest.fn()
    const future = new Date()
    future.setDate(future.getDate() + 40)
    render(<MobileDatePicker disableFuture value={future} onError={onError} onChange={() => {}} />)
    expect(onError).toHaveBeenCalledWith('disableFuture', future)
    expect(onError).toHaveBeenCalledTimes(1)
  })

  // 桌機版：可直接打字；未打完是 Invalid Date（預約頁靠此擋送出），打完為 Date
  it('桌機版分段輸入：未完成為 Invalid Date，完成為 Date', () => {
    withDesktop(() => {
      const onChange = jest.fn()
      render(<DatePicker value={null} onChange={onChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      '20261005'.split('').forEach(key => fireEvent.keyDown(input, { key }))
      const values = onChange.mock.calls.map(c => iso(c[0]))
      expect(values[0]).toBe('Invalid Date')
      expect(values[values.length - 1]).toBe('2026-10-5 0:0')
      expect(input).toHaveValue('2026/10/05')
      const openBtn = screen.getByRole('button', { name: '選擇日期' })
      expect(openBtn.className).toContain('h-10')
      expect(openBtn.className).toContain('w-10')
      expect(openBtn.parentElement.className).toContain('h-7')
      expect(openBtn.parentElement.className).toContain('w-7')
      expect(openBtn).toHaveAttribute('title', '選擇日期')
    })
  })

  // 打帳單四兄弟以 css={{ width: '100%' }} 讓帳單日期撐滿欄位：className 必須落在最外層（同 MUI 落在 TextField 根節點），欄位再撐滿它
  it('className 落在最外層，內部欄位撐滿', () => {
    const { container } = render(<MobileDatePicker className="order-date" value={new Date(2026, 9, 20)} onChange={() => {}} />)
    expect(container.firstChild).toHaveClass('ui-date-picker', 'order-date')
    expect(container.firstChild).not.toHaveClass('w-[220px]')
    expect(container.firstChild.firstChild).toHaveClass('w-full')
  })

  // 會員卡到期日、記帳日期：頁面以 slotProps.textField.onKeyDown 處理 Enter 跳下一欄。原本這個 handler 被欄位自己的按鍵處理蓋掉，
  // Enter 一律打開月曆。現在先呼叫頁面的 handler；頁面有傳 handler 時 Enter 歸頁面、不開月曆（多數頁面跳欄後沒有 preventDefault，
  // 原本會跳欄又開月曆，Codex review PR #265）；沒傳 handler 時維持 Enter／空白鍵開月曆
  it('手機版：slotProps.textField.onKeyDown 會被呼叫；它 preventDefault 時 Enter 不開月曆', () => {
    const onKeyDown = jest.fn(event => {
      if (event.key === 'Enter') event.preventDefault()
    })
    render(<MobileDatePicker value={new Date(2026, 9, 20)} onChange={() => {}} slotProps={{ textField: { onKeyDown } }} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    // 頁面沒處理的按鍵（空白鍵）照常開月曆
    fireEvent.keyDown(input, { key: ' ' })
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('手機版：頁面的 handler 沒有 preventDefault 時 Enter 也不開月曆（頁面用 Enter 跳下一欄）；空白鍵照常開；props.onKeyDown 也會被呼叫', () => {
    const slotKeyDown = jest.fn()
    const propKeyDown = jest.fn()
    render(<MobileDatePicker value={new Date(2026, 9, 20)} onChange={() => {}} onKeyDown={propKeyDown} slotProps={{ textField: { onKeyDown: slotKeyDown } }} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(propKeyDown).toHaveBeenCalledTimes(1)
    expect(slotKeyDown).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(screen.getByRole('textbox'), { key: ' ' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    cleanup()

    // 只傳 props.onKeyDown（員工領用編輯）也一樣
    render(<MobileDatePicker value={new Date(2026, 9, 20)} onChange={() => {}} onKeyDown={propKeyDown} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.queryByRole('dialog')).toBeNull()
    cleanup()

    // 沒傳 handler：Enter 照常開月曆

    render(<MobileDatePicker value={new Date(2026, 9, 20)} onChange={() => {}} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('桌機版：slotProps.textField.onKeyDown 也會被呼叫（原本被 props.onKeyDown 蓋掉）', () => {
    withDesktop(() => {
      const slotKeyDown = jest.fn()
      render(<DatePicker value={new Date(2026, 9, 20)} onChange={() => {}} slotProps={{ textField: { onKeyDown: slotKeyDown } }} />)
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
      expect(slotKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  // 自訂欄位（DateSelector 的月份按鈕）：收到 value、format 與開啟用的 onClick
  it('slots.field 收到 value／format／onClick', () => {
    const Field = ({ value, format, onClick }) => (
      <button type="button" onClick={onClick}>
        {format}:{value.getMonth() + 1}
      </button>
    )
    render(<MobileDatePicker views={['month', 'year']} format="yyyy/MM" value={new Date(2026, 9, 1)} slots={{ field: Field }} onChange={() => {}} />)
    act(() => {
      fireEvent.click(screen.getByText('yyyy/MM:10'))
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('ui/date-field', () => {
  it('parseFormat 切出年月日時分與分隔字', () => {
    expect(parseFormat('yyyy/MM/dd HH:mm')).toEqual([{ token: 'yyyy' }, { sep: '/' }, { token: 'MM' }, { sep: '/' }, { token: 'dd' }, { sep: ' ' }, { token: 'HH' }, { sep: ':' }, { token: 'mm' }])
  })

  // 2/30 這種不存在的日期不可被進位成 3/2 偷偷存進去
  it('不存在的日期回傳 Invalid Date', () => {
    const onChange = jest.fn()
    render(<DateField format="yyyy/MM/dd" value={null} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    '20260230'.split('').forEach(key => fireEvent.keyDown(input, { key }))
    expect(iso(onChange.mock.calls[onChange.mock.calls.length - 1][0])).toBe('Invalid Date')
  })
})
