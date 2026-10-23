import React from 'react'
import { cleanup, fireEvent, render, screen, wait, within } from '@testing-library/react'
import { DatePicker, MobileDatePicker, MobileDateTimePicker } from '../date-picker'

// 保護正式浮層遷移：值生命週期、外點契約、受控開關與日期焦點。
const initial = new Date(2026, 9, 20)
let originalMatchMedia
beforeEach(() => {
  originalMatchMedia = window.matchMedia
  window.matchMedia = query => ({ matches: query === '(pointer: fine)', addEventListener() {}, removeEventListener() {} })
})
afterEach(() => {
  cleanup()
  window.matchMedia = originalMatchMedia
})

const Harness = ({ Picker, onAccept, onClose }) => {
  const [value, setValue] = React.useState(initial)
  return <><Picker value={value} onChange={setValue} onAccept={onAccept} onClose={onClose} closeOnSelect={false} /><output data-testid="value">{value.getDate()}</output><button>外部按鈕</button></>
}
const openPicker = Picker => {
  const opener = Picker === DatePicker ? screen.getByRole('button', { name: /^選擇日期/ }) : screen.getByRole('textbox')
  opener.focus()
  fireEvent.click(opener)
  return opener
}

test.each([DatePicker, MobileDatePicker])('%s 開啟後聚焦所選日期；Esc 保留新值、只通知一次並還原焦點', async Picker => {
  const onAccept = jest.fn()
  const onClose = jest.fn()
  render(<Harness Picker={Picker} onAccept={onAccept} onClose={onClose} />)
  const opener = openPicker(Picker)
  expect(screen.getByRole('gridcell', { name: '2026年10月20日' })).toHaveFocus()
  fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月25日' }))
  expect(screen.getByTestId('value')).toHaveTextContent('25')
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByTestId('value')).toHaveTextContent('25')
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(onAccept).not.toHaveBeenCalled()
  await wait(() => expect(opener).toHaveFocus())
})

test('桌機保留 mousedown 外點契約：欄位及面板不關、焦點移出不關、外點保留值', () => {
  const onClose = jest.fn()
  const onAccept = jest.fn()
  render(<Harness Picker={DatePicker} onClose={onClose} onAccept={onAccept} />)
  const opener = openPicker(DatePicker)
  fireEvent.mouseDown(opener)
  fireEvent.mouseDown(screen.getByRole('dialog'))
  fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月25日' }))
  screen.getByRole('button', { name: '外部按鈕' }).focus()
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
  fireEvent.mouseDown(document.body)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByTestId('value')).toHaveTextContent('25')
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(onAccept).not.toHaveBeenCalled()
})

test('手機背景關閉保留已選值，不觸發確認', async () => {
  const onClose = jest.fn()
  const onAccept = jest.fn()
  render(<Harness Picker={MobileDatePicker} onClose={onClose} onAccept={onAccept} />)
  openPicker(MobileDatePicker)
  fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月25日' }))
  // Radix 外部事件於 effect 後開始監聽。
  await new Promise(resolve => setTimeout(resolve, 0))
  fireEvent(document.body, new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
  fireEvent.click(document.body)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByTestId('value')).toHaveTextContent('25')
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(onAccept).not.toHaveBeenCalled()
})

test.each([DatePicker, MobileDatePicker])('%s 受控 open 在 Esc／外點只通知 onClose，由呼叫端關閉', async Picker => {
  const onClose = jest.fn()
  const props = { open: true, value: initial, onClose }
  const { rerender } = render(<Picker {...props} />)
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  if (Picker === DatePicker) fireEvent.mouseDown(document.body)
  else {
    await new Promise(resolve => setTimeout(resolve, 0))
    fireEvent(document.body, new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    fireEvent.click(document.body)
  }
  expect(onClose).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  rerender(<Picker {...props} open={false} />)
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('手機取消還原，重開確認接受新值', () => {
  const onAccept = jest.fn()
  render(<Harness Picker={MobileDatePicker} onAccept={onAccept} />)
  openPicker(MobileDatePicker)
  fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月25日' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByText('取消'))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByTestId('value')).toHaveTextContent('20')
  expect(onAccept).not.toHaveBeenCalled()
  openPicker(MobileDatePicker)
  fireEvent.click(screen.getByRole('gridcell', { name: '2026年10月26日' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByText('確認'))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(onAccept).toHaveBeenCalledTimes(1)
  expect(onAccept).toHaveBeenCalledWith(new Date(2026, 9, 26))
})

test.each([DatePicker, MobileDatePicker])('%s 由外層切換 open 時，每次還原當次開啟焦點', async Picker => {
  const Harness = () => {
    const [open, setOpen] = React.useState(false)
    return <><button onClick={() => setOpen(true)}>第一個入口</button><button onClick={() => setOpen(true)}>第二個入口</button><Picker open={open} value={initial} onClose={() => setOpen(false)} /></>
  }
  render(<Harness />)
  for (const name of ['第一個入口', '第二個入口']) {
    const opener = screen.getByRole('button', { name })
    opener.focus()
    fireEvent.click(opener)
    expect(screen.getByRole('gridcell', { name: '2026年10月20日' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    await wait(() => expect(opener).toHaveFocus())
  }
})

test.each([
  ['月份', MobileDatePicker, { views: ['month'] }],
  ['時間', MobileDateTimePicker, { openTo: 'hours' }],
])('手機 %s 視圖開啟時焦點進入對話框', (label, Picker, props) => {
  render(<Picker value={initial} {...props} />)
  const input = screen.getByRole('textbox')
  input.focus()
  fireEvent.click(input)
  expect(screen.getByRole('dialog')).toContainElement(document.activeElement)
})
