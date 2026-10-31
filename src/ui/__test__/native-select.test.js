// 保護 NativeSelect 在第三波（2026/10/30）新增的能力。全站單選下拉從 form-control Select 搬到這裡，
// 這些能力不能少：少了任何一項，搬過來的欄位行為就會改變（空欄位突然顯示文字、唯讀變可改、非受控欄位選了不會留住…）。
import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { NativeSelect, NativeSelectOption } from '../native-select'

afterEach(cleanup)

// 舊版 dom-accessibility-api 不會用 <label for> 幫 role=combobox 的按鈕命名，改用 getByLabelText（與既有 form-inputs 測試相同）
const trigger = () => screen.getByLabelText('狀態')
const pick = name => {
  fireEvent.click(trigger())
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name }))
}
const options = [
  <NativeSelectOption key="none" value="">
    未選擇
  </NativeSelectOption>,
  <NativeSelectOption key="a" value="A">
    啟用
  </NativeSelectOption>,
  <NativeSelectOption key="b" value={2}>
    停用
  </NativeSelectOption>,
]

describe('NativeSelect 空值顯示', () => {
  it('預設（displayEmpty）維持原本行為：有 value="" 的選項時顯示它的文字', () => {
    render(
      <NativeSelect label="狀態" value="" onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveTextContent('未選擇')
  })

  it('displayEmpty={false} 且沒有 placeholder：值為空時欄位顯示空白', () => {
    const { rerender } = render(
      <NativeSelect label="狀態" value="" displayEmpty={false} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(trigger().className).toMatch(/text-transparent/)
    rerender(
      <NativeSelect label="狀態" value={null} displayEmpty={false} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(trigger().className).toMatch(/text-transparent/)
    rerender(
      <NativeSelect label="狀態" value="A" displayEmpty={false} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveTextContent('啟用')
    expect(trigger().className).not.toMatch(/text-transparent/)
  })

  // Jason 2026/10/30 決定：從 form-control 搬來、還沒選的欄位顯示「請選擇…」，不再空白；
  // 原本可以選回空值的欄位（清單裡有 value='' 的選項），改完仍要能選回空值。
  it('displayEmpty={false}＋placeholder：值為空時顯示「請選擇…」，空值選項仍可選來清空', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <NativeSelect label="狀態" value="" displayEmpty={false} placeholder="請選擇…" onChange={onChange}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveTextContent('請選擇…')
    expect(trigger().className).not.toMatch(/text-transparent/)
    rerender(
      <NativeSelect label="狀態" value="A" displayEmpty={false} placeholder="請選擇…" onChange={onChange}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveTextContent('啟用')
    pick('未選擇')
    expect(onChange.mock.calls[0][0].target.value).toBe('')
  })
})

describe('NativeSelect 非受控（defaultValue）', () => {
  it('沒傳 value 時記住使用者選的項目，並照常回傳原始值（數字維持數字）', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect label="狀態" defaultValue="" name="status" onChange={onChange}>
        {options}
      </NativeSelect>
    )
    pick('停用')
    expect(onChange.mock.calls[0][0].target).toEqual({ value: 2, name: 'status' })
    expect(trigger()).toHaveTextContent('停用')
  })

  it('有傳 value（受控）時不自己記，畫面以 value 為準', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect label="狀態" value="A" onChange={onChange}>
        {options}
      </NativeSelect>
    )
    pick('停用')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(trigger()).toHaveTextContent('啟用')
  })
})

describe('NativeSelect 唯讀與其他轉傳', () => {
  it('readOnly：點選項不會呼叫 onChange（活動規則檢視模式不可改）', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect label="狀態" value="A" readOnly onChange={onChange}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveAttribute('aria-readonly', 'true')
    fireEvent.change(document.querySelector('select'), { target: { value: '2' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  // 原本由 form-control Select 的測試守住（2026/10/30 移除 Select 時搬來）：唯讀欄位仍可 Enter 跳欄、Tab 離開
  it('readOnly：方向鍵等按鍵被擋下，Enter／Tab 保留；onKeyDown 照常收到', () => {
    const onKeyDown = jest.fn()
    const { rerender } = render(
      <NativeSelect label="狀態" value="A" readOnly onKeyDown={onKeyDown}>
        {options}
      </NativeSelect>
    )
    const press = key => {
      const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      trigger().dispatchEvent(ev)
      return ev.defaultPrevented
    }
    expect(press('ArrowDown')).toBe(true)
    expect(press('Enter')).toBe(false)
    expect(press('Tab')).toBe(false)
    expect(onKeyDown).toHaveBeenCalledTimes(3)
    rerender(
      <NativeSelect label="狀態" value="A" onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(press('Tab')).toBe(false)
  })

  it('renderValue：按鈕顯示自訂內容（偏好設計師載入中）', () => {
    render(
      <NativeSelect label="狀態" value="loading" renderValue={v => `顯示:${v}`} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(trigger()).toHaveTextContent('顯示:loading')
  })

  it('inputRef 與 inputProps.ref 都拿到可聚焦的按鈕；inputProps 其他屬性落在按鈕上（F 鍵快捷聚焦、測試 data-testid）', () => {
    const inputRef = React.createRef()
    const propsRef = React.createRef()
    render(
      <NativeSelect label="狀態" value="A" inputRef={inputRef} inputProps={{ ref: propsRef, 'data-testid': 'status-select' }} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(inputRef.current).toBe(trigger())
    expect(propsRef.current).toBe(trigger())
    expect(screen.getByTestId('status-select')).toBe(trigger())
    inputRef.current.focus()
    expect(document.activeElement).toBe(trigger())
  })

  it('inputRef 是函式（callback ref）時也拿到按鈕；卸載時收到 null', () => {
    const inputRef = jest.fn()
    const { unmount } = render(
      <NativeSelect label="狀態" value="A" inputRef={inputRef} onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(inputRef).toHaveBeenCalledWith(trigger())
    unmount()
    expect(inputRef).toHaveBeenLastCalledWith(null)
  })

  it('size="small" 用較矮的高度；labelId 連到外部標籤', () => {
    render(
      <>
        <span id="outer-label">外部標籤</span>
        <NativeSelect value="A" size="small" labelId="outer-label" onChange={() => {}}>
          {options}
        </NativeSelect>
      </>
    )
    const button = screen.getByRole('combobox', { name: '外部標籤' })
    expect(button.className).toMatch(/h-8/)
  })

  it('labelRef 指到標籤元素：原本掛在 InputLabel 的 ref（預約頁量標籤寬度）搬過來後仍拿得到', () => {
    const labelRef = React.createRef()
    render(
      <NativeSelect label="狀態" labelRef={labelRef} value="A" onChange={() => {}}>
        {options}
      </NativeSelect>
    )
    expect(labelRef.current.tagName).toBe('LABEL')
    expect(labelRef.current).toHaveTextContent('狀態')
  })

  it('onChange 第二參數與 form-control Select 相同（{ props }）：客戶來源篩選讀 child.props.value', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect label="狀態" value="" onChange={onChange}>
        {options}
      </NativeSelect>
    )
    pick('停用')
    expect(onChange.mock.calls[0][1].props.value).toBe(2)
  })
})
