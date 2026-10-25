// 保護自家下拉的鍵盤選取，以及開在對話框裡時清單不被 DialogBody 裁掉。
// onChange 的 event.target.value 仍是選項索引字串；隱藏的 presentation select 仍給既有測試讀選項、fireEvent.change。
import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Dialog, DialogBody, DialogContent, DialogTitle } from '../dialog'
import { IndexSelect } from '../index-select'

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
