import React from 'react'
import { act, cleanup, fireEvent, render, screen, wait as waitFor } from '@testing-library/react'
import Autocomplete from '../combobox'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import PasswordDialog from '../../components/PasswordDialog'

afterEach(cleanup)

// 捕捉的退化：blur 同步移除選單，讓 Radix 在滑鼠焦點交接空檔聚焦容器。
test.each([false, true])('選單 blur 不搶走同窗按鈕焦點，密碼窗取消還原觸發鈕（受控=%s）', async controlled => {
  const closed = jest.fn()
  function Menu() {
    const [menuOpen, setMenuOpen] = React.useState(false)
    return <Autocomplete options={['剪髮', '染髮']} open={controlled ? menuOpen : undefined}
      onOpen={() => setMenuOpen(true)} onClose={(event, reason) => { closed(event, reason); setMenuOpen(false) }} />
  }
  function Harness() {
    const [passwordOpen, setPasswordOpen] = React.useState(false)
    return <Dialog open><DialogContent id="lower" hideClose aria-describedby={undefined}>
      <DialogTitle>下層</DialogTitle>
      <Menu />
      <button id="open-upper" onClick={() => setPasswordOpen(true)}>開啟密碼窗</button>
      <PasswordDialog open={passwordOpen} title="密碼確認" inputLabel="操作密碼" inputOnChange={() => {}}
        handleOnCancel={() => setPasswordOpen(false)} handleOnConfirm={() => {}} />
    </DialogContent></Dialog>
  }
  render(<Harness />)
  const input = screen.getByRole('combobox')
  const trigger = screen.getByRole('button', { name: '開啟密碼窗' })
  act(() => input.focus())
  fireEvent.click(input)
  const menu = screen.getByRole('listbox')
  expect(screen.getByRole('dialog')).toContainElement(menu)
  // 先清空開選單的 MutationObserver 通知，隔離接下來 blur 的 DOM 變動。
  await act(async () => { await Promise.resolve() })
  fireEvent.mouseDown(trigger)
  // jsdom 的 blur() 沒有目的地；補上真實滑鼠交接的 relatedTarget，
  // 仍用原生 blur 讓 activeElement 真正成為 body，且保留真實 Radix observer。
  document.addEventListener('focusout', event => {
    Object.defineProperty(event, 'relatedTarget', { value: trigger })
  }, { once: true, capture: true })
  act(() => input.blur())
  expect(document.activeElement).toBe(document.body)
  await Promise.resolve()
  // 瀏覽器尚未完成預設聚焦前，容器不可插隊，否則 Chrome 會中止按鈕聚焦。
  expect(document.activeElement).toBe(document.body)
  act(() => trigger.focus())
  fireEvent.mouseUp(trigger)
  expect(trigger).toHaveFocus()
  fireEvent.click(trigger)
  expect(screen.getByLabelText('操作密碼')).toHaveFocus()
  await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  expect(screen.getByLabelText('操作密碼')).toHaveFocus()
  expect(closed).toHaveBeenCalledTimes(1)
  expect(closed.mock.calls[0][1]).toBe('blur')
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  await waitFor(() => expect(screen.queryByLabelText('操作密碼')).toBeNull())
  await waitFor(() => expect(trigger).toHaveFocus())
})


test('窗內選值時程式移焦，延後的 blur 保留新選值', async () => {
  function Harness() {
    const [value, setValue] = React.useState('剪髮')
    const next = React.useRef(null)
    return <Dialog open><DialogContent hideClose aria-describedby={undefined}>
      <DialogTitle>選值移焦</DialogTitle>
      <Autocomplete autoSelect autoHighlight options={['剪髮', '染髮']} value={value} onChange={(event, selected) => {
        setValue(selected)
        next.current.focus()
      }} />
      <button ref={next}>下一欄</button>
    </DialogContent></Dialog>
  }
  render(<Harness />)
  const input = screen.getByRole('combobox')
  act(() => input.focus())
  fireEvent.change(input, { target: { value: '染' } })
  fireEvent.click(screen.getByRole('option', { name: '染髮' }))
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  expect(input).toHaveValue('染髮')
  expect(screen.getByRole('button', { name: '下一欄' })).toHaveFocus()
})
