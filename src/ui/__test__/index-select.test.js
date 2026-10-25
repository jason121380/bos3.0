// 保護自家下拉的鍵盤選取，以及開在對話框裡時清單不被 DialogBody 裁掉。
// onChange 的 event.target.value 仍是選項索引字串；隱藏的 presentation select 仍給既有測試讀選項、fireEvent.change。
import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Dialog, DialogBody, DialogContent, DialogTitle } from '../dialog'
import { IndexSelect } from '../index-select'

// 這個 jsdom 沒有 PointerEvent，fireEvent.pointer* 會退成沒有座標的 Event。補上才能測滑動與觸控。
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

afterEach(cleanup)

const OPTIONS = [
  { text: '甲' },
  { text: '乙', disabled: true },
  { text: '丙' },
]

const renderSelect = (props = {}) => {
  const onChange = jest.fn()
  render(
    <IndexSelect
      name="status"
      valueIndex={0}
      options={OPTIONS}
      onChange={onChange}
      buttonProps={{ 'aria-label': '狀態' }}
      {...props}
    />
  )
  return onChange
}

const trigger = () => screen.getByRole('combobox', { name: '狀態' })
// 隱藏的 presentation select 也有 option，清單裡的選項要從 listbox 取
const listOption = name => within(screen.getByRole('listbox')).getByRole('option', { name })

describe('IndexSelect 鍵盤選取', () => {
  it('方向鍵打開後在可選項目間移動，Enter 以索引選取，停用項目略過', () => {
    const onChange = renderSelect()
    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(listOption('甲')).toHaveAttribute('data-active', 'true')
    expect(trigger()).toHaveAttribute('aria-activedescendant', listOption('甲').id)

    fireEvent.keyDown(trigger(), { key: 'ArrowDown' })
    expect(listOption('丙')).toHaveAttribute('data-active', 'true')
    expect(listOption('乙')).not.toHaveAttribute('data-active')
    expect(listOption('乙')).toHaveAttribute('aria-disabled', 'true')

    fireEvent.keyDown(trigger(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target).toEqual({ value: '2', name: 'status' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger()).toHaveFocus()
  })

  it('空白鍵選取作用中的項目；方向鍵往上停在第一個可選項目', () => {
    const onChange = renderSelect()
    fireEvent.keyDown(trigger(), { key: 'ArrowUp' })
    expect(listOption('甲')).toHaveAttribute('data-active', 'true')
    fireEvent.keyDown(trigger(), { key: ' ' })
    expect(onChange.mock.calls[0][0].target.value).toBe('0')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('選項本身可用 Enter 選取，停用選項按 Enter 不選', () => {
    const onChange = renderSelect()
    fireEvent.click(trigger())
    const enabled = listOption('丙')
    enabled.focus()
    fireEvent.keyDown(enabled, { key: 'Enter' })
    expect(onChange.mock.calls[0][0].target.value).toBe('2')

    fireEvent.click(trigger())
    const disabled = listOption('乙')
    disabled.focus()
    fireEvent.keyDown(disabled, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('滑鼠點選仍以索引呼叫 onChange；隱藏 select 維持 presentation，change 仍走索引', () => {
    const onChange = renderSelect()
    const hidden = document.querySelector('select[name="status"]')
    expect(hidden).toHaveAttribute('role', 'presentation')
    expect(hidden).toHaveAttribute('tabindex', '-1')
    expect([...hidden.options].map(option => option.textContent)).toEqual(['甲', '乙', '丙'])

    fireEvent.click(trigger())
    fireEvent.click(listOption('丙'))
    expect(onChange.mock.calls[0][0].target.value).toBe('2')

    fireEvent.change(trigger(), { target: { value: '0' } })
    expect(onChange.mock.calls[1][0].target.value).toBe('0')
  })
})

const touch = (node, type, x, y) => fireEvent[type](node, { pointerType: 'touch', pointerId: 1, clientX: x, clientY: y, button: 0 })

describe('IndexSelect 觸控第一次就選取', () => {
  it('pointerup 選取，不需要再送 click；接著的 click 不會再選一次', () => {
    const onChange = renderSelect()
    fireEvent.click(trigger())
    const option = listOption('丙')
    touch(option, 'pointerDown', 10, 10)
    touch(option, 'pointerUp', 12, 11)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].target.value).toBe('2')
    fireEvent.click(option)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('手指移動超過 10px 當成捲動，不選取，接著的 click 也不選', () => {
    const onChange = renderSelect()
    fireEvent.click(trigger())
    const option = listOption('丙')
    touch(option, 'pointerDown', 0, 0)
    touch(option, 'pointerUp', 0, 24)
    fireEvent.click(option)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('停用項目的觸控不選取', () => {
    const onChange = renderSelect()
    fireEvent.click(trigger())
    const option = listOption('乙')
    touch(option, 'pointerDown', 4, 4)
    touch(option, 'pointerUp', 4, 4)
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('IndexSelect 在對話框內', () => {
  it('清單掛到對話框而不是 DialogBody，點選項仍選得到', () => {
    const onChange = jest.fn()
    render(
      <Dialog open>
        <DialogContent hideClose aria-describedby={undefined}>
          <DialogTitle>上架狀態</DialogTitle>
          <DialogBody data-testid="dialog-body" className="max-h-10 overflow-y-auto">
            <IndexSelect
              name="sale"
              valueIndex={0}
              options={OPTIONS}
              onChange={onChange}
              buttonProps={{ 'aria-label': '狀態' }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
    fireEvent.click(trigger())
    const list = screen.getByRole('listbox')
    const body = screen.getByTestId('dialog-body')
    expect(body.contains(list)).toBe(false)
    expect(screen.getByRole('dialog').contains(list)).toBe(true)
    expect(list.style.position).toBe('absolute')

    fireEvent.click(listOption('丙'))
    expect(onChange.mock.calls[0][0].target.value).toBe('2')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
