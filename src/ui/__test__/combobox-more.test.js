import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Autocomplete, createFilterOptions } from '../combobox'

// 保護什麼：搜尋下拉（ui/combobox，取代 MUI Autocomplete，全站 81 處）在 combobox.test.js 以外的行為：
// - 失焦（React 17 的 onBlur 走 focusout，故以 fireEvent.focusOut 觸發）：預設把文字還原成已選值；autoSelect 選走反白項；
//   freeSolo 保留輸入；手指正按在選單上時不處理（iPhone 點選項）。
// - 清除鈕、下拉箭頭、多選標籤的移除鈕；Esc 清空輸入；freeSolo 多選以 Enter 新增。
// - 受控 inputValue／onInputChange、onOpen／onClose 的事件與 reason、在對話框內時選單掛在對話框裡。
// - 欄位外觀：label／required／error／helperText／small／disabled／寬度；沒給 renderInput 也能用。

afterEach(cleanup)

const TextField = () => null
const options = [
  { id: 'a', name: '洗髮' },
  { id: 'b', name: '剪髮' },
  { id: 'c', name: '染髮' },
]
const getOptionLabel = o => o.name

const renderAc = (props = {}, fieldProps = {}) => {
  const onChange = props.onChange || jest.fn()
  const utils = render(
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      onChange={onChange}
      renderInput={params => <TextField {...params} placeholder="請選擇" {...fieldProps} />}
      {...props}
    />
  )
  return { ...utils, onChange, input: screen.getByPlaceholderText('請選擇') }
}

describe('createFilterOptions', () => {
  it('trim、區分大小寫、limit；getOptionLabel 回傳 null 時視為空字串', () => {
    const opts = [{ n: 'Ab' }, { n: 'ab' }, { n: null }, { n: 'xab' }]
    const label = o => o.n
    expect(createFilterOptions({ trim: true })(opts, { inputValue: '  ab ', getOptionLabel: label })).toEqual([opts[0], opts[1], opts[3]])
    expect(createFilterOptions({ ignoreCase: false })(opts, { inputValue: 'ab', getOptionLabel: label })).toEqual([opts[1], opts[3]])
    expect(createFilterOptions({ limit: 1 })(opts, { inputValue: '', getOptionLabel: label })).toEqual([opts[0]])
  })
})

describe('預設 getOptionLabel 與選項', () => {
  it('字串選項直接顯示；物件用 label；沒有 label 的值原樣轉字串', () => {
    render(<Autocomplete options={['甲', { label: '乙' }, 3]} renderInput={params => <TextField {...params} placeholder="請選擇" />} />)
    fireEvent.click(screen.getByPlaceholderText('請選擇'))
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['甲', '乙', '3'])
  })

  it('沒給 options 時顯示「查無符合」；loading 時顯示載入中', () => {
    const { rerender } = render(<Autocomplete renderInput={params => <TextField {...params} placeholder="請選擇" />} />)
    fireEvent.click(screen.getByPlaceholderText('請選擇'))
    expect(screen.getByText('查無符合')).toBeInTheDocument()
    rerender(<Autocomplete loading renderInput={params => <TextField {...params} placeholder="請選擇" />} />)
    expect(screen.getByText('載入中…')).toBeInTheDocument()
  })

  it('沒給 renderInput 也能用（只是沒有標籤）；預設寬度 240px', () => {
    const { container } = render(<Autocomplete options={options} getOptionLabel={getOptionLabel} />)
    const input = container.querySelector('input')
    fireEvent.click(input)
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(container.firstChild.className).toContain('w-[240px]')
  })
})

describe('值與輸入文字', () => {
  it('defaultValue（非受控）顯示已選文字；開啟時該項標 aria-selected；值不在選項內時仍顯示值本身的文字', () => {
    const { input, unmount } = renderAc({ defaultValue: options[1] })
    expect(input).toHaveValue('剪髮')
    fireEvent.click(input)
    expect(screen.getByRole('option', { name: '剪髮' })).toHaveAttribute('aria-selected', 'true')
    unmount()
    const { input: input2 } = renderAc({ value: { id: 'z', name: '已下架' } })
    expect(input2).toHaveValue('已下架')
  })

  it('受控 inputValue 由外層決定；onInputChange 收到 (event, text, reason)', () => {
    const onInputChange = jest.fn()
    const { input } = renderAc({ value: null, inputValue: '固定', onInputChange })
    fireEvent.change(input, { target: { value: '固定x' } })
    expect(onInputChange).toHaveBeenCalledWith(expect.anything(), '固定x', 'input')
    expect(input).toHaveValue('固定')
  })

  it('沒有 onChange 時選取不拋錯（非受控自己記住）', () => {
    const { input } = renderAc({ onChange: undefined })
    fireEvent.click(input)
    fireEvent.click(screen.getByText('染髮'))
    expect(input).toHaveValue('染髮')
  })

  it('TextField 的 onFocus／onChange 照常收到；連續輸入不重複呼叫 onOpen', () => {
    const onFocus = jest.fn()
    const onFieldChange = jest.fn()
    const onOpen = jest.fn()
    const { input } = renderAc({ onOpen }, { onFocus, onChange: onFieldChange })
    fireEvent.focus(input)
    fireEvent.focusIn(input)
    fireEvent.change(input, { target: { value: '剪' } })
    fireEvent.change(input, { target: { value: '剪髮' } })
    expect(onFocus).toHaveBeenCalled()
    expect(onFieldChange).toHaveBeenCalledTimes(2)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})

describe('失焦（focusout）', () => {
  it('預設：還原成已選值的文字並關閉選單、呼叫 onClose(event, "blur")', () => {
    const onClose = jest.fn()
    const { input } = renderAc({ value: options[0], onClose })
    fireEvent.change(input, { target: { value: '亂打' } })
    expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    fireEvent.focusOut(input)
    expect(input).toHaveValue('洗髮')
    expect(onClose).toHaveBeenCalledWith(expect.anything(), 'blur')
  })

  it('autoSelect：失焦選走反白的選項', () => {
    const { input, onChange } = renderAc({ value: null, autoSelect: true, autoHighlight: true })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.focusOut(input)
    expect(onChange.mock.calls[0][1]).toEqual(options[0])
  })

  it('autoSelect 但沒有反白項時照一般規則還原', () => {
    const { input, onChange } = renderAc({ value: null, autoSelect: true })
    fireEvent.change(input, { target: { value: '亂打' } })
    fireEvent.focusOut(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('')
  })

  it('freeSolo：失焦保留輸入文字；clearOnBlur 時還原', () => {
    const { input, unmount } = renderAc({ value: null, freeSolo: true })
    fireEvent.change(input, { target: { value: '自訂' } })
    fireEvent.focusOut(input)
    expect(input).toHaveValue('自訂')
    unmount()
    const { input: input2 } = renderAc({ value: null, freeSolo: true, clearOnBlur: true })
    fireEvent.change(input2, { target: { value: '自訂' } })
    fireEvent.focusOut(input2)
    expect(input2).toHaveValue('')
  })

  it('freeSolo 多選：失焦保留未送出的文字；非 freeSolo 多選失焦清空文字', () => {
    const { input, unmount } = renderAc({ multiple: true, value: [], freeSolo: true })
    fireEvent.change(input, { target: { value: '自訂' } })
    fireEvent.focusOut(input)
    expect(input).toHaveValue('自訂')
    unmount()
    const { input: input2 } = renderAc({ multiple: true, value: [] })
    fireEvent.change(input2, { target: { value: '剪' } })
    fireEvent.focusOut(input2)
    expect(input2).toHaveValue('')
  })

  it('freeSolo 且沒輸入過（非 dirty）時失焦不改文字', () => {
    const { input } = renderAc({ value: null, freeSolo: true, inputValue: '外部' })
    fireEvent.focusOut(input)
    expect(input).toHaveValue('外部')
  })

  it('手指正按在選單上（1 秒內）時失焦不關選單', () => {
    const { input } = renderAc({ value: null })
    fireEvent.click(input)
    fireEvent.pointerDown(screen.getByRole('listbox'))
    fireEvent.focusOut(input)
    expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('受控 open 下直接失焦：onClose 收到替代事件 { type: "close" }', () => {
    const onClose = jest.fn()
    const { input } = renderAc({ value: null, open: true, onClose })
    act(() => input.focus())
    fireEvent.focusOut(input)
    expect(onClose.mock.calls[0][0]).toEqual(expect.objectContaining({ type: expect.any(String) }))
    expect(onClose.mock.calls[0][1]).toBe('blur')
  })
})

describe('鍵盤', () => {
  it('Autocomplete 自己的 onKeyDown 也會被呼叫', () => {
    const onKeyDown = jest.fn()
    const { input } = renderAc({ onKeyDown })
    fireEvent.keyDown(input, { key: 'a' })
    expect(onKeyDown).toHaveBeenCalled()
  })

  it('freeSolo 多選：Enter 把輸入文字加成一個標籤並清空輸入', () => {
    const { input, onChange } = renderAc({ multiple: true, freeSolo: true, value: [options[0]] })
    fireEvent.change(input, { target: { value: '自訂' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [options[0], '自訂'], 'createOption', { option: '自訂' })
    expect(input).toHaveValue('')
  })

  it('選單關閉後按 Esc 清空輸入文字（reason=clear）；選單開著時 Esc 只關選單', () => {
    const onInputChange = jest.fn()
    const { input } = renderAc({ value: null, onInputChange })
    fireEvent.change(input, { target: { value: '亂打' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onInputChange).not.toHaveBeenCalledWith(expect.anything(), '', 'clear')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onInputChange).toHaveBeenCalledWith(expect.anything(), '', 'clear')
  })

  it('唯讀時 Backspace 不移除標籤', () => {
    const { input, onChange } = renderAc({ multiple: true, readOnly: true, value: [options[0]] })
    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('清除鈕、箭頭與標籤', () => {
  it('聚焦且有值時顯示清除鈕；按下以 null（reason=clear）清除並把焦點留在輸入框', () => {
    const { input, onChange } = renderAc({ value: options[0] })
    expect(screen.queryByLabelText('清除')).toBeNull()
    fireEvent.focus(input)
    fireEvent.focusIn(input)
    const clear = screen.getByLabelText('清除')
    expect(clear).toHaveAttribute('title', '清除')
    expect(clear.className).toContain('before:h-10')
    fireEvent.mouseDown(clear)
    expect(onChange).toHaveBeenCalledWith(expect.anything(), null, 'clear', undefined)
    expect(document.activeElement).toBe(input)
  })

  it('多選清除為空陣列', () => {
    const { input, onChange } = renderAc({ multiple: true, value: [options[0]] })
    fireEvent.focusIn(input)
    fireEvent.mouseDown(screen.getByLabelText('清除'))
    expect(onChange).toHaveBeenCalledWith(expect.anything(), [], 'clear', undefined)
  })

  it('箭頭按下切換開關並聚焦輸入框；唯讀時無作用', () => {
    const { container, input, unmount } = renderAc({ value: null })
    const arrow = container.querySelector('[role="presentation"]')
    fireEvent.mouseDown(arrow)
    expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    expect(document.activeElement).toBe(input)
    expect(arrow.className).toContain('rotate-180')
    fireEvent.mouseDown(arrow)
    expect(screen.getByRole('listbox')).toHaveClass('hidden')
    unmount()
    const { container: c2, input: input2 } = renderAc({ value: null, readOnly: true })
    fireEvent.mouseDown(c2.querySelector('[role="presentation"]'))
    fireEvent.click(input2)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('停用時點輸入框不開；自訂 popupIcon 取代箭頭', () => {
    const { input, container } = renderAc({ value: null, disabled: true, popupIcon: <i data-testid="icon" /> })
    fireEvent.click(input)
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    fireEvent.mouseDown(container.querySelector('[role="presentation"]'))
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('多選標籤的移除鈕：按下移除該項（reason=removeOption）；點已選項目也會移除', () => {
    const { input, onChange } = renderAc({ multiple: true, value: [options[0], options[1]] })
    const remove = screen.getByLabelText('移除 洗髮')
    expect(remove.className).toContain('before:h-10')
    expect(remove).toHaveAttribute('title', '移除 洗髮')
    fireEvent.mouseDown(remove)
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), [options[1]], 'removeOption', { option: options[0] })
    fireEvent.click(input)
    fireEvent.click(screen.getByRole('option', { name: '剪髮' }))
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), [options[0]], 'removeOption', { option: options[1] })
  })

  it('多選 value 不是陣列時視為空', () => {
    renderAc({ multiple: true, value: null })
    expect(screen.queryByLabelText(/移除/)).toBeNull()
  })

  it('點選單本身（mousedown）不讓輸入框失焦', () => {
    const { input } = renderAc({ value: null })
    fireEvent.click(input)
    const ev = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    screen.getByRole('listbox').dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
  })
})

describe('選單位置與欄位外觀', () => {
  it('在對話框內時選單掛在對話框裡，以對話框為座標系定位', () => {
    render(
      <div role="dialog">
        <Autocomplete
          options={options}
          getOptionLabel={getOptionLabel}
          value={null}
          renderInput={params => <TextField {...params} placeholder="請選擇" />}
        />
      </div>
    )
    fireEvent.click(screen.getByPlaceholderText('請選擇'))
    const listbox = screen.getByRole('listbox')
    expect(listbox.closest('[role="dialog"]')).not.toBeNull()
    expect(listbox.style.position).toBe('absolute')
  })

  it('label／required／error／helperText／small／disabled／inputRef（函式）', () => {
    const inputRef = jest.fn()
    const { container, input } = renderAc(
      { value: null },
      { label: '服務', required: true, error: true, helperText: '必填', size: 'small', disabled: true, inputRef }
    )
    expect(inputRef).toHaveBeenCalledWith(input)
    const label = screen.getByText('服務')
    expect(label.className).toContain('text-danger')
    expect(label.querySelector('.text-danger').textContent).toBe(' *')
    expect(screen.getByText('必填').className).toContain('text-danger')
    const box = input.parentElement
    expect(box.className).toContain('min-h-8')
    expect(box.className).toContain('border-danger')
    expect(box.className).toContain('pointer-events-none')
    expect(container.firstChild.className).toContain('w-full')
  })

  it('沒有錯誤時 helperText 為一般說明色、標籤為次要文字色', () => {
    renderAc({ value: null }, { label: '服務', helperText: '可輸入代號' })
    expect(screen.getByText('可輸入代號').className).toContain('text-text-tertiary')
    expect(screen.getByText('服務').className).toContain('text-text-secondary')
  })
})

// 2026/10/30：點（或 Enter）目前已選的那一項，原本清單停著、輸入框留著搜尋字；比照選別項收起清單、還原文字，
// 仍比照 MUI 不呼叫 onChange（員工下拉另由 StaffCombobox 補送給 handler）。
describe('單選再選一次目前的項目', () => {
  it('點選：不呼叫 onChange，收起清單、文字還原成已選項目', () => {
    const { input, onChange } = renderAc({ value: options[1], isOptionEqualToValue: (o, v) => o.id === v.id })
    fireEvent.change(input, { target: { value: '剪' } })
    fireEvent.click(screen.getByRole('option', { name: '剪髮' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(input).toHaveValue('剪髮')
  })

  it('Enter：同樣收起；disableCloseOnSelect 時維持原狀（清單保持開啟、不呼叫 onChange）', () => {
    const { input, onChange, unmount } = renderAc({ value: options[1], autoHighlight: true, isOptionEqualToValue: (o, v) => o.id === v.id })
    act(() => input.focus())
    fireEvent.change(input, { target: { value: '剪' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(input).toHaveValue('剪髮')
    unmount()
    const again = renderAc({ value: options[1], disableCloseOnSelect: true, isOptionEqualToValue: (o, v) => o.id === v.id })
    fireEvent.change(again.input, { target: { value: '剪' } })
    fireEvent.click(screen.getByRole('option', { name: '剪髮' }))
    expect(again.onChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })
})
