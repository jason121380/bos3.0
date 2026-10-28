import React from 'react'
import { cleanup, fireEvent, render, screen, wait as waitFor } from '@testing-library/react'
import PasswordDialog from '../../components/PasswordDialog'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../dialog'
import { DatePicker, MobileDatePicker } from '../date-picker'
import Autocomplete from '../combobox'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../dropdown-menu'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../select'

const Shell = ({ children, onOpenChange, ...props }) => <Dialog open onOpenChange={onOpenChange}><DialogContent aria-describedby={undefined} {...props}><DialogTitle>下層對話框</DialogTitle>{children}</DialogContent></Dialog>
const pressEscape = target => fireEvent.keyDown(target || document.activeElement, { key: 'Escape', code: 'Escape' })
const clickPointer = target => {
  fireEvent.pointerDown(target, { pointerType: 'mouse', button: 0 })
  fireEvent.pointerUp(target, { pointerType: 'mouse', button: 0 })
  fireEvent.click(target)
}
let originalMatchMedia
beforeEach(() => {
  originalMatchMedia = window.matchMedia
  window.matchMedia = query => ({ matches: query === '(pointer: fine)', addEventListener() {}, removeEventListener() {} })
  Element.prototype.scrollIntoView = () => {}
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
})
afterEach(() => {
  cleanup()
  window.matchMedia = originalMatchMedia
})

describe('共用對話框跨圖層互動', () => {
  test.each([['桌機', DatePicker], ['手機', MobileDatePicker]])('%s 日期選擇器可選取且不觸發下層外部事件', async (label, Picker) => {
    const onChange = jest.fn()
    const onOpenChange = jest.fn()
    const outside = jest.fn()
    render(<Shell onOpenChange={onOpenChange} onPointerDownOutside={outside} onInteractOutside={outside} onFocusOutside={outside}><Picker value={new Date(2026, 9, 20)} onChange={onChange} /></Shell>)
    clickPointer(label === '桌機' ? screen.getByRole('button', { name: /^選擇日期/ }) : screen.getByRole('textbox'))
    const day = screen.getByRole('gridcell', { name: '2026年10月25日' })
    // jsdom 不計算命中區；瀏覽器測試另驗證實際滑鼠與焦點。
    day.focus()
    expect(day).toHaveFocus()
    clickPointer(day)
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 25))
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(outside).not.toHaveBeenCalled()
    expect(screen.getByText('下層對話框')).toBeInTheDocument()
  })

  test.each([['桌機', DatePicker], ['手機', MobileDatePicker]])('%s 日期選擇器先接收 Esc，下次才關閉對話框', async (label, Picker) => {
    const onOpenChange = jest.fn()
    render(<Shell onOpenChange={onOpenChange}><Picker value={new Date(2026, 9, 20)} onChange={() => {}} /></Shell>)
    const opener = label === '桌機' ? screen.getByRole('button', { name: /^選擇日期/ }) : screen.getByRole('textbox')
    opener.focus()
    clickPointer(opener)
    const day = screen.getByRole('gridcell', { name: '2026年10月25日' })
    day.focus()
    pressEscape(day)
    await waitFor(() => expect(screen.queryByRole('gridcell', { name: '2026年10月25日' })).toBeNull())
    expect(onOpenChange).not.toHaveBeenCalled()
    await waitFor(() => expect(opener).toHaveFocus())
    pressEscape(screen.getByRole('dialog', { name: '下層對話框' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  test('搜尋下拉選單留在對話框內並可選取', () => {
    const onChange = jest.fn()
    const onOpenChange = jest.fn()
    render(<Shell onOpenChange={onOpenChange}><Autocomplete options={['甲店', '乙店']} onChange={onChange} /></Shell>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '甲' } })
    const option = screen.getByRole('option', { name: '甲店' })
    expect(screen.getByRole('dialog')).toContainElement(option)
    clickPointer(option)
    expect(onChange.mock.calls[0][1]).toBe('甲店')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('搜尋下拉第一次 Esc 關選單，第二次才關對話框', async () => {
    const onOpenChange = jest.fn()
    render(<Shell onOpenChange={onOpenChange}><Autocomplete options={['甲店', '乙店']} /></Shell>)
    const input = screen.getByRole('combobox')
    input.focus()
    fireEvent.change(input, { target: { value: '甲' } })
    expect(screen.getByRole('option', { name: '甲店' })).toBeInTheDocument()
    pressEscape(input)
    await waitFor(() => expect(screen.queryByRole('option', { name: '甲店' })).toBeNull())
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(input).toHaveFocus()
    pressEscape(input)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  test('Popover 內按鈕可操作，Esc 只關浮層', async () => {
    const action = jest.fn()
    const onOpenChange = jest.fn()
    render(<Shell onOpenChange={onOpenChange}><Popover><PopoverTrigger>開啟浮層</PopoverTrigger><PopoverContent aria-label="浮層"><button onClick={action}>浮層動作</button></PopoverContent></Popover></Shell>)
    clickPointer(screen.getByText('開啟浮層'))
    clickPointer(screen.getByText('浮層動作'))
    expect(action).toHaveBeenCalledTimes(1)
    pressEscape(screen.getByText('浮層動作'))
    await waitFor(() => expect(screen.queryByText('浮層動作')).toBeNull())
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('Select 可選值且不關閉下層', async () => {
    const onValueChange = jest.fn()
    const onOpenChange = jest.fn()
    render(<Shell onOpenChange={onOpenChange}><Select onValueChange={onValueChange}><SelectTrigger aria-label="狀態"><SelectValue placeholder="選狀態" /></SelectTrigger><SelectContent><SelectItem value="published">已發佈</SelectItem></SelectContent></Select></Shell>)
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    const option = await screen.findByRole('option', { name: '已發佈' })
    fireEvent.keyDown(option, { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('published')
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test('Radix 雙層堆疊：焦點與 Esc 只屬於最上層', async () => {
    const lowerClose = jest.fn()
    const Harness = () => {
      const [upper, setUpper] = React.useState(false)
      return <><Shell onOpenChange={lowerClose}><button onClick={() => setUpper(true)}>開啟上層</button></Shell><Dialog open={upper} onOpenChange={setUpper}><DialogContent aria-describedby={undefined}><DialogTitle>上層對話框</DialogTitle><input aria-label="上層輸入" /></DialogContent></Dialog></>
    }
    render(<Harness />)
    const opener = screen.getByText('開啟上層')
    opener.focus()
    clickPointer(opener)
    const input = screen.getByRole('textbox', { name: '上層輸入' })
    input.focus()
    expect(input).toHaveFocus()
    pressEscape(input)
    await waitFor(() => expect(screen.queryByRole('textbox', { name: '上層輸入' })).toBeNull())
    expect(lowerClose).not.toHaveBeenCalled()
    await waitFor(() => expect(opener).toHaveFocus())
    pressEscape(opener)
    expect(lowerClose).toHaveBeenCalledTimes(1)
  })

  test('受控且沒有 onOpenChange 的對話框不因 Esc 或背景消失', () => {
    render(<Shell hideClose><button>保留內容</button></Shell>)
    pressEscape(screen.getByText('保留內容'))
    fireEvent.pointerDown(document.body)
    expect(screen.getByText('保留內容')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '關閉' })).toBeNull()
  })

  test('保留不自動聚焦與禁止 Esc／背景關閉的呼叫端設定', () => {
    const onOpenChange = jest.fn()
    const prevent = event => event.preventDefault()
    render(<Shell onOpenChange={onOpenChange} onOpenAutoFocus={prevent} onEscapeKeyDown={prevent} onPointerDownOutside={prevent}><input aria-label="店家搜尋" /></Shell>)
    expect(screen.getByRole('textbox')).not.toHaveFocus()
    pressEscape(screen.getByRole('dialog'))
    fireEvent.pointerDown(document.body)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

describe('圖層重新開啟', () => {
  test.each(['正式彈窗', 'Popover', 'Select'])('%s 關閉再開啟後仍高於下層', async kind => {
    const Harness = () => {
      const [open, setOpen] = React.useState(false)
      return <Shell data-testid="順序下層">
        <button onClick={() => setOpen(true)}>開啟順序上層</button>
        {kind === '正式彈窗' && <Dialog open={open} onOpenChange={setOpen}><DialogContent data-testid="順序上層" aria-describedby={undefined}><DialogTitle>順序上層</DialogTitle><button onClick={() => setOpen(false)}>關閉順序上層</button></DialogContent></Dialog>}
        {kind === 'Popover' && <Popover open={open} onOpenChange={setOpen}><PopoverTrigger>浮層錨點</PopoverTrigger><PopoverContent data-testid="順序上層"><button onClick={() => setOpen(false)}>關閉順序上層</button></PopoverContent></Popover>}
        {kind === 'Select' && <Select open={open} onOpenChange={setOpen}><SelectTrigger aria-label="順序選單"><SelectValue /></SelectTrigger><SelectContent data-testid="順序上層"><SelectItem value="關閉">關閉順序上層</SelectItem></SelectContent></Select>}
      </Shell>
    }
    render(<Harness />)
    const lower = screen.getByTestId('順序下層')
    for (let round = 0; round < 2; round += 1) {
      clickPointer(screen.getByText('開啟順序上層'))
      const upper = screen.getByTestId('順序上層')
      expect(Number(upper.style.zIndex)).toBeGreaterThan(Number(lower.style.zIndex))
      pressEscape(kind === 'Select' ? screen.getByRole('option') : screen.getByText('關閉順序上層'))
      await waitFor(() => expect(screen.queryByTestId('順序上層')).toBeNull())
      expect(lower).toBeInTheDocument()
    }
  })

})

describe('正式對話框內層互動', () => {
  test('正式 Dialog 內 Popover 點回下層內容會關閉浮層', async () => {
    render(<Dialog open><DialogContent hideClose aria-label="下層對話框" aria-labelledby={undefined} aria-describedby={undefined}><button>浮層外動作</button><Popover><PopoverTrigger>開啟內層浮層</PopoverTrigger><PopoverContent><button>內層內容</button></PopoverContent></Popover></DialogContent></Dialog>)
    clickPointer(screen.getByText('開啟內層浮層'))
    expect(screen.getByText('內層內容')).toBeInTheDocument()
    // Radix 的 pointerdown outside listener 於下一個 task 安裝。
    await new Promise(resolve => setTimeout(resolve, 0))
    clickPointer(screen.getByText('浮層外動作'))
    await waitFor(() => expect(screen.queryByText('內層內容')).toBeNull())
  })

  test('正式 Dialog 內 Dropdown 開啟時禁用下層 pointer，關閉後還原', async () => {
    render(<Dialog open><DialogContent hideClose aria-label="下層對話框" aria-labelledby={undefined} aria-describedby={undefined} data-testid="下拉相容根"><DropdownMenu><DropdownMenuTrigger>開啟操作選單</DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>操作項目</DropdownMenuItem></DropdownMenuContent></DropdownMenu></DialogContent></Dialog>)
    const root = screen.getByTestId('下拉相容根')
    fireEvent.keyDown(screen.getByText('開啟操作選單'), { key: 'ArrowDown' })
    const item = await screen.findByRole('menuitem')
    await waitFor(() => expect(root.style.pointerEvents).toBe('none'))
    pressEscape(item)
    await waitFor(() => expect(screen.queryByRole('menuitem')).toBeNull())
    await waitFor(() => expect(root.style.pointerEvents).toBe('auto'))
  })

  test('Popover 內日期浮層不觸發下層關閉，點回對話框可關閉 Popover', async () => {
    const lowerClose = jest.fn()
    const onChange = jest.fn()
    render(<Shell onOpenChange={lowerClose}><button>日期浮層外動作</button><Popover><PopoverTrigger>開啟日期浮層</PopoverTrigger><PopoverContent data-testid="日期Popover"><DatePicker value={new Date(2026, 9, 20)} onChange={onChange} /></PopoverContent></Popover></Shell>)
    clickPointer(screen.getByText('開啟日期浮層'))
    clickPointer(screen.getByRole('button', { name: /^選擇日期/ }))
    await new Promise(resolve => setTimeout(resolve, 0))
    const day = screen.getByRole('gridcell', { name: '2026年10月25日' })
    day.focus()
    clickPointer(day)
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 25))
    expect(screen.getByTestId('日期Popover')).toBeInTheDocument()
    expect(lowerClose).not.toHaveBeenCalled()
    clickPointer(screen.getByText('日期浮層外動作'))
    await waitFor(() => expect(screen.queryByTestId('日期Popover')).toBeNull())
    expect(lowerClose).not.toHaveBeenCalled()
  })

  test('正式 Dialog 內 Select 開啟時禁用下層 pointer，關閉後還原', async () => {
    render(<Dialog open><DialogContent hideClose aria-label="下層對話框" aria-labelledby={undefined} aria-describedby={undefined} data-testid="相容根"><Select><SelectTrigger aria-label="內層選單"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="甲">甲選項</SelectItem></SelectContent></Select></DialogContent></Dialog>)
    const root = screen.getByTestId('相容根')
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' })
    const option = await screen.findByRole('option')
    await waitFor(() => expect(root.style.pointerEvents).toBe('none'))
    pressEscape(option)
    await waitFor(() => expect(screen.queryByRole('option')).toBeNull())
    await waitFor(() => expect(root.style.pointerEvents).toBe('auto'))
  })

})

test('正式對話框更換 ref 時清除舊 ref 並交出同一個面板', () => {
  const first = jest.fn()
  const second = React.createRef()
  const panel = ref => <Dialog open><DialogContent ref={ref} aria-describedby={undefined}><DialogTitle>保留參照</DialogTitle></DialogContent></Dialog>
  const view = render(panel(first))
  const content = screen.getByRole('dialog', { name: '保留參照' })
  view.rerender(panel(second))
  expect(first).toHaveBeenLastCalledWith(null)
  expect(second.current).toBe(content)
})

test('非受控 DialogTrigger 開窗後 Esc 只通知一次並還原觸發鈕', async () => {
  const changed = jest.fn()
  const escaped = jest.fn()
  render(<Dialog onOpenChange={changed}><DialogTrigger>非受控開窗</DialogTrigger><DialogContent onEscapeKeyDown={escaped} aria-describedby={undefined}><DialogTitle>非受控測試</DialogTitle></DialogContent></Dialog>)
  const opener = screen.getByText('非受控開窗')
  opener.focus()
  clickPointer(opener)
  pressEscape(screen.getByRole('dialog'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(opener).toHaveFocus())
  expect(changed.mock.calls).toEqual([[true], [false]])
  expect(escaped).toHaveBeenCalledTimes(1)
})

test('實際 PasswordDialog 在正式窗內開關兩次，Esc 不關窗且每次還原原焦點', async () => {
  const closeLower = jest.fn()
  const confirm = jest.fn()
  const Harness = () => {
    const [open, setOpen] = React.useState(false)
    const [password, setPassword] = React.useState('')
    return <Dialog open onOpenChange={closeLower}><DialogContent hideClose aria-label="下層對話框" aria-labelledby={undefined} aria-describedby={undefined}>
      <Autocomplete options={['剪髮', '染髮']} />
      <button onClick={() => setOpen(true)}>開啟真實密碼窗</button>
      <PasswordDialog open={open} title="真實密碼" inputLabel="操作密碼" inputOnChange={setPassword} handleOnCancel={() => setOpen(false)} handleOnConfirm={() => { confirm(password); setOpen(false) }} />
    </DialogContent></Dialog>
  }
  render(<Harness />)
  const opener = screen.getByText('開啟真實密碼窗')
  for (const action of ['取消', '確認']) {
    opener.focus()
    clickPointer(opener)
    const input = screen.getByLabelText('操作密碼')
    fireEvent.change(input, { target: { value: '測試密碼' } })
    input.focus()
    pressEscape(input)
    expect(input).toHaveFocus()
    expect(closeLower).not.toHaveBeenCalled()
    clickPointer(screen.getByRole('button', { name: action, exact: true }))
    await waitFor(() => expect(screen.queryByLabelText('操作密碼')).toBeNull())
    await waitFor(() => expect(opener).toHaveFocus())
  }
  expect(confirm).toHaveBeenCalledWith('測試密碼')
})

test('搜尋選單選值後可重開兩次，每次 Esc 只關選單', async () => {
  const lowerClose = jest.fn()
  render(<Shell onOpenChange={lowerClose}><Autocomplete options={['剪髮', '染髮']} /></Shell>)
  const input = screen.getByRole('combobox')
  input.focus()
  clickPointer(input)
  clickPointer(screen.getByRole('option', { name: '染髮' }))
  expect(input).toHaveValue('染髮')
  for (let round = 0; round < 2; round += 1) {
    clickPointer(input)
    expect(screen.getByRole('option', { name: '染髮' })).toBeInTheDocument()
    pressEscape(input)
    await waitFor(() => expect(screen.queryByRole('option')).toBeNull())
    expect(lowerClose).not.toHaveBeenCalled()
  }
  pressEscape(input)
  expect(lowerClose).toHaveBeenCalledTimes(1)
})

test('Select 非受控選值關閉後解除圖層，下次 Esc 關下層', async () => {
  const lowerClose = jest.fn()
  const selectOpen = jest.fn()
  const selected = jest.fn()
  render(<Shell onOpenChange={lowerClose}><Select onOpenChange={selectOpen} onValueChange={selected}><SelectTrigger aria-label="重開選項"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="染髮">染髮</SelectItem></SelectContent></Select></Shell>)
  const trigger = screen.getByRole('combobox')
  fireEvent.keyDown(trigger, { key: 'ArrowDown' })
  const option = screen.getByRole('option')
  fireEvent.keyDown(option, { key: 'Enter' })
  await waitFor(() => expect(screen.queryByRole('option')).toBeNull())
  expect(selected).toHaveBeenCalledWith('染髮')
  expect(selectOpen.mock.calls).toEqual([[true], [false]])
  pressEscape(trigger)
  expect(lowerClose).toHaveBeenCalledTimes(1)
})
