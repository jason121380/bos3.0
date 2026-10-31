// IndexSelect（NativeSelect 的自家清單）其餘行為：
// - 舊原生 select 的相容面：按鈕的 options／selectedIndex／querySelector('option') 讀得到選項，原生 change 仍以索引通知；
//   這是全站幾百個頁面測試與頁面程式依賴的契約，壞了等於所有下拉選單選不到值。
// - 唯讀／停用不可改值（帳單、薪資等鎖定欄位）；
// - 觸控選取後吞掉相容 click 的時間窗、點清單外關閉、對話框內延後關閉（不擋到對話框內按鈕的 click）。
import React from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Dialog, DialogBody, DialogContent, DialogTitle } from '../dialog'
import { IndexSelect } from '../index-select'

const installedPointerEvent = typeof window.PointerEvent !== 'function'
if (installedPointerEvent) {
  window.PointerEvent = class PointerEvent extends window.MouseEvent {
    constructor(type, props = {}) {
      super(type, props)
      this.pointerId = props.pointerId == null ? 1 : props.pointerId
      this.pointerType = props.pointerType || ''
      this.isPrimary = props.isPrimary !== false
    }
  }
}
afterAll(() => {
  if (installedPointerEvent) delete window.PointerEvent
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

const OPTIONS = [{ text: '甲' }, { text: '乙', disabled: true }, { text: '丙' }]

const renderSelect = (props = {}) => {
  const onChange = jest.fn()
  const utils = render(
    <IndexSelect name="status" valueIndex={0} options={OPTIONS} onChange={onChange} buttonProps={{ 'aria-label': '狀態' }} {...props} />
  )
  return { onChange, ...utils }
}
const trigger = () => screen.getByRole('combobox', { name: '狀態' })
const listOption = name => within(screen.getByRole('listbox')).getByRole('option', { name })
const touch = (node, type, x, y, pointerType = 'touch') => fireEvent[type](node, { pointerType, pointerId: 1, clientX: x, clientY: y, button: 0 })

describe('IndexSelect 與舊原生 select 相容', () => {
  it('ref（函式）與 inputRef（物件）都拿到按鈕；按鈕讀得到選項、選取索引與 option 查詢', () => {
    let fnNode = null
    const inputRef = React.createRef()
    renderSelect({ ref: node => (fnNode = node), inputRef, valueIndex: 2 })
    const button = trigger()
    expect(fnNode).toBe(button)
    expect(inputRef.current).toBe(button)
    expect([...button.options].map(o => o.textContent)).toEqual(['甲', '乙', '丙'])
    expect(button.selectedIndex).toBe(2)
    expect([...button.selectedOptions].map(o => o.textContent)).toEqual(['丙'])
    expect(button.querySelector('option:checked').textContent).toBe('丙')
    expect(button.querySelectorAll('option')).toHaveLength(3)
    // 非 option 的查詢仍走按鈕本身（顯示文字在按鈕內的 span）
    expect(button.querySelector('span').textContent).toBe('')
    expect(button.querySelectorAll('svg')).toHaveLength(1)
  })

  it('瀏覽器把屬性鎖成不可設定時維持原狀，不拋錯', () => {
    const lock = node => {
      if (!node) return
      ;['options', 'selectedOptions', 'selectedIndex', 'querySelector', 'querySelectorAll'].forEach(key => {
        if (!Object.getOwnPropertyDescriptor(node, key)) Object.defineProperty(node, key, { configurable: false, value: 'locked' })
      })
    }
    expect(() => renderSelect({ ref: lock })).not.toThrow()
    expect(trigger().options).toBe('locked')
    expect(trigger().querySelector).toBe('locked')
  })

  it('按鈕上的原生 change 以索引通知，事件方法轉給原事件', () => {
    const { onChange } = renderSelect()
    const button = trigger()
    button.value = '2'
    const event = new Event('change', { bubbles: true, cancelable: true })
    button.dispatchEvent(event)
    expect(onChange).toHaveBeenCalledTimes(1)
    const received = onChange.mock.calls[0][0]
    expect(received.target).toEqual({ value: '2', name: '' })
    expect(received.defaultPrevented).toBe(false)
    received.preventDefault()
    received.stopPropagation()
    received.persist()
    expect(received.defaultPrevented).toBe(true)
    expect(event.defaultPrevented).toBe(true)
  })

  it('隱藏 select 的 React change（有 persist 的合成事件）原樣交給 onChange', () => {
    const { onChange } = renderSelect()
    fireEvent.change(document.querySelector('select[name="status"]'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(typeof onChange.mock.calls[0][0].persist).toBe('function')
  })

  it('唯讀時原生 change 不通知；沒給 onChange 時改值也不拋錯', () => {
    const { onChange } = renderSelect({ readOnly: true })
    fireEvent.change(trigger(), { target: { value: '2' } })
    expect(onChange).not.toHaveBeenCalled()
    cleanup()
    render(<IndexSelect name="x" valueIndex={0} options={OPTIONS} buttonProps={{ 'aria-label': '狀態' }} />)
    expect(() => fireEvent.change(trigger(), { target: { value: '2' } })).not.toThrow()
    fireEvent.click(trigger())
    expect(() => fireEvent.click(listOption('丙'))).not.toThrow()
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('IndexSelect 外觀與無障礙', () => {
  it('有 id 時清單與選項 id 以它為前綴（aria-controls／activedescendant 才對得上）', () => {
    render(<IndexSelect id="sale" name="s" valueIndex={0} options={OPTIONS} onChange={jest.fn()} labelledBy="sale-label" />)
    const button = screen.getByRole('combobox')
    expect(button).toHaveAttribute('aria-labelledby', 'sale-label')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-controls', 'sale-list')
    expect(button).toHaveAttribute('aria-activedescendant', 'sale-list-option-0')
  })

  it('blank 時不顯示文字；small、invalid 套用對應樣式與 aria-invalid', () => {
    renderSelect({ blank: true, display: '甲', small: true, invalid: true, required: true })
    expect(trigger()).toHaveTextContent('')
    expect(trigger()).toHaveClass('h-8', 'text-transparent', 'border-danger')
    expect(trigger()).toHaveAttribute('aria-invalid', 'true')
    expect(trigger()).toHaveAttribute('aria-required', 'true')
  })

  it('鍵盤移動時把作用中項目捲進視野', () => {
    const scrollIntoView = jest.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    try {
      renderSelect()
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
      fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: 'nearest' })
    } finally {
      delete Element.prototype.scrollIntoView
    }
  })
})

describe('IndexSelect 唯讀與停用', () => {
  it('清單打開中改成唯讀（例如帳單鎖定）時，選項上的方向鍵不再移動', () => {
    const { rerender, onChange } = renderSelect()
    fireEvent.click(trigger())
    rerender(<IndexSelect name="status" valueIndex={0} options={OPTIONS} onChange={onChange} buttonProps={{ 'aria-label': '狀態' }} readOnly />)
    fireEvent.keyDown(listOption('甲'), { key: 'ArrowDown' })
    expect(listOption('甲')).toHaveAttribute('data-active', 'true')
  })

  it('唯讀：點擊不展開、方向鍵不展開，除了 Enter／Tab 都擋下預設行為，仍轉給 onKeyDown', () => {
    const onKeyDown = jest.fn()
    renderSelect({ readOnly: true, onKeyDown })
    fireEvent.click(trigger())
    expect(screen.queryByRole('listbox')).toBeNull()
    const arrow = fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(arrow).toBe(false)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(fireEvent.keyDown(trigger(), { key: 'Tab' })).toBe(true)
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    expect(trigger()).toHaveAttribute('aria-readonly', 'true')
  })

  it('停用：鍵盤不展開', () => {
    renderSelect({ disabled: true })
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})

describe('IndexSelect 清單操作', () => {
  it('再按一次觸發器收起清單', () => {
    renderSelect()
    fireEvent.click(trigger())
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.click(trigger())
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('未選值時打開，作用中是第一個可選項目；往上方向鍵從最後一個可選項目開始', () => {
    renderSelect({
      valueIndex: -1,
      emptyLabel: '請選擇',
      options: [{ text: '甲', disabled: true }, { text: '乙' }, { text: '丙' }, { text: '丁', disabled: true }],
    })
    expect(trigger()).toHaveClass('text-text-tertiary')
    fireEvent.click(trigger())
    expect(listOption('乙')).toHaveAttribute('data-active', 'true')
    fireEvent.click(trigger())
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    expect(listOption('丙')).toHaveAttribute('data-active', 'true')
  })

  it('已打開但沒有作用中項目、也沒選值時，方向鍵跳到邊緣的可選項目', () => {
    renderSelect({ valueIndex: -1, options: [{ text: '甲', disabled: true }, { text: '乙' }, { text: '丙' }] })
    fireEvent.click(trigger())
    // 滑鼠移到停用項目不改作用中；改用沒有可選項目的情況：直接把作用中移走
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    expect(listOption('乙')).toHaveAttribute('data-active', 'true')
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    expect(listOption('乙')).toHaveAttribute('data-active', 'true')
  })

  it('全部停用時：打開沒有作用中項目，方向鍵與 Enter 都不選', () => {
    const { onChange } = renderSelect({
      valueIndex: -1,
      options: [
        { text: '甲', disabled: true },
        { text: '乙', disabled: true },
      ],
    })
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(trigger()).not.toHaveAttribute('aria-activedescendant')
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    fireEvent.keyDown(trigger(), { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('沒有選項時打開不拋錯，方向鍵沒有作用中項目', () => {
    renderSelect({ valueIndex: -1, options: [] })
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(within(screen.getByRole('listbox')).queryAllByRole('option')).toHaveLength(0)
  })

  it('打開時按其他鍵不選取；關閉時 Enter 不做事', () => {
    const { onChange } = renderSelect()
    fireEvent.keyDown(trigger(), { key: 'Enter' })
    expect(screen.queryByRole('listbox')).toBeNull()
    fireEvent.click(trigger())
    fireEvent.keyDown(trigger(), { key: 'a' })
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('滑鼠移過可選項目改變作用中，移過停用或目前項目不變', () => {
    renderSelect()
    fireEvent.click(trigger())
    fireEvent.mouseMove(listOption('丙'))
    expect(listOption('丙')).toHaveAttribute('data-active', 'true')
    fireEvent.mouseMove(listOption('丙'))
    fireEvent.mouseMove(listOption('乙'))
    expect(listOption('丙')).toHaveAttribute('data-active', 'true')
    // 按下選項時不把焦點移進清單（否則按鈕失焦、清單先關）
    expect(fireEvent.mouseDown(listOption('甲'))).toBe(false)
  })

  it('焦點在選項上：方向鍵移動、空白鍵選取、Esc 收起並回到觸發器、其他鍵不做事', () => {
    const { onChange } = renderSelect()
    fireEvent.click(trigger())
    const first = listOption('甲')
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    expect(listOption('丙')).toHaveAttribute('data-active', 'true')
    fireEvent.keyDown(first, { key: 'x' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.keyDown(first, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger()).toHaveFocus()
    fireEvent.click(trigger())
    fireEvent.keyDown(listOption('丙'), { key: ' ' })
    expect(onChange.mock.calls[0][0].target.value).toBe('2')
  })

  it('觸發器上按 Esc 收起清單並保留焦點', () => {
    renderSelect()
    trigger().focus()
    fireEvent.click(trigger())
    fireEvent.keyDown(trigger(), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it('點停用項目不選、不關', () => {
    const { onChange } = renderSelect()
    fireEvent.click(trigger())
    fireEvent.click(listOption('乙'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })
})

describe('IndexSelect 觸控與相容 click', () => {
  it('滑鼠的 pointer 事件不走觸控選取（由 click 選）', () => {
    const { onChange } = renderSelect()
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 1, 1, 'mouse')
    touch(listOption('丙'), 'pointerUp', 1, 1, 'mouse')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('pointercancel（系統接手捲動）後的 pointerup 不選；在別的項目放開也不選', () => {
    const { onChange } = renderSelect()
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 1, 1)
    fireEvent.pointerCancel(listOption('丙'))
    touch(listOption('丙'), 'pointerUp', 1, 1)
    touch(listOption('甲'), 'pointerDown', 1, 1)
    touch(listOption('丙'), 'pointerUp', 1, 1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('觸控選取後清單卸載，相容 click 落在下方元件時被吞掉；500ms 後恢復正常 click', () => {
    jest.useFakeTimers()
    const below = jest.fn()
    const onChange = jest.fn()
    render(
      <div>
        <IndexSelect name="s" valueIndex={0} options={OPTIONS} onChange={onChange} buttonProps={{ 'aria-label': '狀態' }} />
        <button type="button" onClick={below}>
          下方按鈕
        </button>
      </div>
    )
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 1, 1)
    touch(listOption('丙'), 'pointerUp', 1, 1)
    expect(onChange).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '下方按鈕' }))
    expect(below).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '下方按鈕' }))
    expect(below).toHaveBeenCalledTimes(1)

    // 再一次觸控但沒有後續 click：時間到自動解除，不吞掉之後的 click
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 1, 1)
    touch(listOption('丙'), 'pointerUp', 1, 30)
    act(() => {
      jest.advanceTimersByTime(500)
    })
    fireEvent.click(screen.getByRole('button', { name: '下方按鈕' }))
    expect(below).toHaveBeenCalledTimes(2)
  })

  it('連續兩次觸控滑動：前一次的吞 click 監聽先移除，不會吞兩次', () => {
    jest.useFakeTimers()
    const below = jest.fn()
    render(
      <div>
        <IndexSelect name="s" valueIndex={0} options={OPTIONS} onChange={jest.fn()} buttonProps={{ 'aria-label': '狀態' }} />
        <button type="button" onClick={below}>
          下方按鈕
        </button>
      </div>
    )
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 0, 0)
    touch(listOption('丙'), 'pointerUp', 0, 30)
    touch(listOption('甲'), 'pointerDown', 0, 0)
    touch(listOption('甲'), 'pointerUp', 0, 30)
    // 相容 click 被 window 捕獲吞掉；同一下觸控若又補送一次 click 落在剛滑過的項目上，以記號擋下，不選取
    fireEvent.click(listOption('甲'))
    fireEvent.click(listOption('甲'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '下方按鈕' }))
    expect(below).toHaveBeenCalledTimes(1)
    act(() => {
      jest.advanceTimersByTime(500)
    })
  })

  it('吞 click 的時間窗內卸載元件會移除監聽', () => {
    jest.useFakeTimers()
    const removeSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = renderSelect()
    fireEvent.click(trigger())
    touch(listOption('丙'), 'pointerDown', 0, 0)
    touch(listOption('丙'), 'pointerUp', 0, 30)
    unmount()
    expect(removeSpy.mock.calls.some(([type, , capture]) => type === 'click' && capture === true)).toBe(true)
    removeSpy.mockRestore()
  })
})

describe('IndexSelect 點清單外關閉', () => {
  it('在頁面上點清單外立即關閉；點觸發器或清單內不關', () => {
    render(
      <div>
        <IndexSelect name="s" valueIndex={0} options={OPTIONS} onChange={jest.fn()} buttonProps={{ 'aria-label': '狀態' }} />
        <p>外面</p>
      </div>
    )
    fireEvent.click(trigger())
    fireEvent.mouseDown(trigger())
    fireEvent.mouseDown(listOption('丙'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('外面'))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('在對話框內點其他地方：延到下一輪才關，讓對話框內按鈕先收到 click', () => {
    jest.useFakeTimers()
    render(
      <Dialog open>
        <DialogContent hideClose aria-describedby={undefined}>
          <DialogTitle>設定</DialogTitle>
          <DialogBody>
            <IndexSelect name="s" valueIndex={0} options={OPTIONS} onChange={jest.fn()} buttonProps={{ 'aria-label': '狀態' }} />
            <p>對話框內文字</p>
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
    fireEvent.click(trigger())
    fireEvent.mouseDown(screen.getByText('對話框內文字'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    act(() => {
      jest.advanceTimersByTime(0)
    })
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('視窗捲動或縮放時重新定位清單', () => {
    renderSelect()
    fireEvent.click(trigger())
    const spy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      top: 100,
      bottom: 140,
      left: 30,
      right: 230,
      width: 200,
      height: 40,
    }))
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(screen.getByRole('listbox').style.left).toBe('30px')
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(screen.getByRole('listbox').style.top).toBe('144px')
    spy.mockRestore()
  })
})
