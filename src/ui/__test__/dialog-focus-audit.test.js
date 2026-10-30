import React from 'react'
import { act, cleanup, fireEvent, render, screen, wait, within } from '@testing-library/react'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import { NativeSelect, NativeSelectOption } from '../native-select'
import { Select as CompatSelect, MenuItem } from '../form-control'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../dropdown-menu'
import { DatePicker, MobileDatePicker } from '../date-picker'
import { DateField } from '../date-field'
import { TextField } from '../text-field'
import { ToastCard } from '../toast'
import PasswordDialog from '../../components/PasswordDialog'

const initial = new Date(2026, 9, 20)
let media
beforeEach(() => {
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  media = window.matchMedia
  window.matchMedia = query => ({ matches: query === '(pointer: fine)', addEventListener() {}, removeEventListener() {} })
})
afterEach(() => { cleanup(); window.matchMedia = media })

function Field({ kind }) {
  if (kind === 'popover') return <Popover><PopoverTrigger>欄位</PopoverTrigger><PopoverContent><input aria-label="浮層輸入" /></PopoverContent></Popover>
  if (kind === 'dropdown') return <DropdownMenu><DropdownMenuTrigger>欄位</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>甲</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  if (kind === 'desktop' || kind === 'mobile') return React.createElement(kind === 'desktop' ? DatePicker : MobileDatePicker, { value: initial, onChange: () => {} })
  if (kind === 'multiple') return <CompatSelect multiple defaultValue={[]}><MenuItem value="a">甲</MenuItem></CompatSelect>
  if (kind === 'native') return <NativeSelect label="欄位" value="a"><NativeSelectOption value="a">甲</NativeSelectOption></NativeSelect>
  if (kind === 'compat') return <CompatSelect value="a" inputProps={{ 'aria-label': '欄位' }}><MenuItem value="a">甲</MenuItem></CompatSelect>
  if (kind === 'date-field') return <DateField label="欄位" value={initial} format="yyyy/MM/dd" />
  return <TextField label="欄位" />
}
function Harness({ kind, lowerClose }) {
  const [password, setPassword] = React.useState(false)
  const [toast, setToast] = React.useState(true)
  return <Dialog open onOpenChange={lowerClose}><DialogContent id="lower" hideClose aria-describedby={undefined}>
    <DialogTitle>焦點稽核</DialogTitle><Field kind={kind} />
    {kind === 'toast' && toast && <ToastCard title="提示" onClose={() => setToast(false)} />}
    <button>下一欄</button>
    <button onClick={() => setPassword(true)}>開啟密碼窗</button>
    <PasswordDialog open={password} title="密碼確認" inputLabel="操作密碼" inputOnChange={() => {}} handleOnCancel={() => setPassword(false)} handleOnConfirm={() => {}} />
  </DialogContent></Dialog>
}
const popupRole = kind => ['desktop', 'mobile'].includes(kind) ? 'grid' : kind === 'dropdown' ? 'menu' : kind === 'popover' ? 'textbox' : 'listbox'
const openField = async kind => {
  let trigger
  if (kind === 'desktop') trigger = screen.getByRole('button', { name: /^選擇日期/ })
  else if (kind === 'mobile') trigger = screen.getByRole('textbox')
  else if (['native', 'compat'].includes(kind)) trigger = screen.getByRole('combobox')
  else trigger = screen.getAllByRole('button')[0]
  act(() => trigger.focus())
  if (kind === 'dropdown') fireEvent.keyDown(trigger, { key: 'ArrowDown' })
  else fireEvent.click(trigger)
  await act(async () => { await Promise.resolve() })
  if (['desktop', 'mobile'].includes(kind)) act(() => screen.getByRole('gridcell', { name: '2026年10月20日' }).focus())
  return trigger
}

// 保留原生 blur、真實 FocusScope observer，以及 activeElement=body 的滑鼠交接空檔。
async function mouseTransfer(target, { pointer = false } = {}) {
  if (pointer) fireEvent.pointerDown(target, { button: 0, pointerType: 'mouse' })
  fireEvent.mouseDown(target)
  const focused = document.activeElement
  if (focused !== document.body) {
    document.addEventListener('focusout', event => Object.defineProperty(event, 'relatedTarget', { value: target }), { once: true, capture: true })
    act(() => focused.blur())
  }
  expect(document.activeElement).toBe(document.body)
  await Promise.resolve()
  expect(document.activeElement).toBe(document.body)
  act(() => target.focus())
  fireEvent.mouseUp(target)
  expect(target).toHaveFocus()
}

test.each(['popover', 'desktop', 'multiple', 'native', 'compat', 'date-field', 'text-field', 'toast'])('%s：同窗滑鼠交接與密碼窗取消不搶焦點', async kind => {
  const lowerClose = jest.fn()
  render(<Harness kind={kind} lowerClose={lowerClose} />)
  if (['native', 'compat', 'date-field', 'text-field', 'toast'].includes(kind)) act(() => screen.getByRole(kind === 'native' || kind === 'compat' ? 'combobox' : 'textbox').focus())
  else await openField(kind)
  const after = screen.getByRole('button', { name: '下一欄' })
  await mouseTransfer(after, { pointer: kind === 'popover' })
  fireEvent.click(after)
  expect(after).toHaveFocus()
  const target = screen.getByRole('button', { name: '開啟密碼窗' })
  await wait(() => {
    if (kind === 'desktop') expect(screen.queryByRole('grid')).toBeNull()
    if (kind === 'multiple') expect(screen.queryByRole('listbox')).toBeNull()
    if (kind === 'popover') expect(screen.queryByLabelText('浮層輸入')).toBeNull()
  })
  await mouseTransfer(target)
  fireEvent.click(target)
  expect(screen.getByLabelText('操作密碼')).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  await wait(() => expect(target).toHaveFocus())
  expect(lowerClose).not.toHaveBeenCalled()
})

test.each(['dropdown', 'popover', 'desktop', 'mobile', 'multiple'])('%s：Escape 只關浮層並還原觸發點', async kind => {
  const lowerClose = jest.fn()
  render(<Harness kind={kind} lowerClose={lowerClose} />)
  const trigger = await openField(kind)
  const popup = screen.getByRole(popupRole(kind))
  // Portal 可以位於 body；焦點由上層 Radix scope 接管，下層不得把它拉回。
  if (kind !== 'multiple') expect(popup.contains(document.activeElement) || popup === document.activeElement).toBe(true)
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  await wait(() => expect(screen.queryByRole(popupRole(kind))).toBeNull())
  await wait(() => expect(trigger).toHaveFocus())
  expect(lowerClose).not.toHaveBeenCalled()
  expect(document.getElementById('lower')).toBeInTheDocument()
})

// modal 選單／手機日期窗阻擋下層指標；先 Escape 解散，再點下層，不能偽造穿透點擊。
test.each(['native', 'dropdown', 'mobile'])('%s：modal 關閉後可移焦並開啟巢狀密碼窗', async kind => {
  render(<Harness kind={kind} />)
  await openField(kind)
  fireEvent.keyDown(document.activeElement, { key: 'Escape' })
  await wait(() => expect(screen.queryByRole(popupRole(kind))).toBeNull())
  const target = screen.getByRole('button', { name: '開啟密碼窗' })
  await mouseTransfer(target)
  fireEvent.click(target)
  fireEvent.click(within(screen.getByRole('dialog', { name: '密碼確認' })).getByRole('button', { name: '取消' }))
  await wait(() => expect(target).toHaveFocus())
})


test('多選外點的延後收尾不影響已開啟的密碼窗焦點', async () => {
  render(<Harness kind="multiple" />)
  await openField('multiple')
  const opener = screen.getByRole('button', { name: '開啟密碼窗' })
  await mouseTransfer(opener)
  fireEvent.click(opener)
  expect(screen.getByLabelText('操作密碼')).toHaveFocus()
  await wait(() => expect(screen.queryByRole('listbox')).toBeNull())
  expect(screen.getByLabelText('操作密碼')).toHaveFocus()
  fireEvent.click(screen.getByRole('button', { name: '取消' }))
  await wait(() => expect(opener).toHaveFocus())
})

test.each(['desktop', 'mobile'])('%s：窗內開啟時即聚焦所選日期', async kind => {
  render(<Harness kind={kind} />)
  const trigger = kind === 'desktop' ? screen.getByRole('button', { name: /^選擇日期/ }) : screen.getByRole('textbox')
  act(() => trigger.focus())
  fireEvent.click(trigger)
  await wait(() => expect(screen.getByRole('gridcell', { name: '2026年10月20日' })).toHaveFocus())
})

// modal 的第一下會命中背景阻擋層，而非下層按鈕；不可用 jsdom 的點穿能力偽造成功。
test.each(['dropdown', 'mobile'])('%s：第一下外點只解散 modal，下一下才聚焦同窗按鈕', async kind => {
  const lowerClose = jest.fn()
  render(<Harness kind={kind} lowerClose={lowerClose} />)
  const trigger = await openField(kind)
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
  fireEvent(document.body, new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
  fireEvent.mouseDown(document.body)
  fireEvent.click(document.body)
  await wait(() => expect(screen.queryByRole(popupRole(kind))).toBeNull())
  await wait(() => expect(trigger).toHaveFocus())
  expect(lowerClose).not.toHaveBeenCalled()
  const after = screen.getByRole('button', { name: '下一欄' })
  await mouseTransfer(after)
  fireEvent.click(after)
  expect(after).toHaveFocus()
  expect(document.getElementById('lower')).toBeInTheDocument()
})
