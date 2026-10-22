import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '../select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../dialog'
import { Tabs, TabsContent } from '../tabs'
import { SettingsSectionHeading, SettingsTabsList, SettingsTabsTrigger } from '../settings-nav'

// 保護什麼：包在 Radix 之上的浮層／選單元件（Select、DropdownMenu、Popover、Dialog、Tabs、設定頁選單）。
// 這些元件畫在 Portal（body 底下），必須自帶 .ui-root（CLAUDE.md 踩雷：Portal 內沒有 ui-root 就沒有 box-sizing 重置），
// 層級要高於相容層 Dialog（z-1300），並維持 Radix 的鍵盤／ARIA 行為（選取、關閉、分頁切換）。

afterEach(cleanup)

// jsdom 沒有 scrollIntoView（Radix Select 開啟時會把選中項目捲進可視範圍）
const realScrollIntoView = Element.prototype.scrollIntoView
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})
afterAll(() => {
  Element.prototype.scrollIntoView = realScrollIntoView
})

describe('Select（Radix）', () => {
  it('展開時選單畫在 Portal、帶 ui-root 與高於 Dialog 的層級，選項標示目前值', () => {
    const onValueChange = jest.fn()
    render(
      <Select open value="b" onValueChange={onValueChange}>
        <SelectTrigger aria-label="付款方式" className="w-40">
          <SelectValue placeholder="請選擇" />
        </SelectTrigger>
        <SelectContent className="extra">
          <SelectGroup>
            <SelectLabel>常用</SelectLabel>
            <SelectItem value="a">現金</SelectItem>
            <SelectSeparator data-testid="sep" />
            <SelectItem value="b">刷卡</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    const listbox = screen.getByRole('listbox')
    expect(listbox.className).toContain('ui-root')
    expect(listbox.className).toContain('z-[1400]')
    // popper 模式下寬度跟觸發鈕一致
    expect(listbox.className).toContain('w-[var(--radix-select-trigger-width)]')
    expect(screen.getByText('常用').className).toContain('text-caption')
    expect(screen.getByTestId('sep').className).toContain('bg-border')
    expect(screen.getByRole('option', { name: '刷卡' })).toHaveAttribute('data-state', 'checked')
    expect(screen.getByRole('option', { name: '現金' })).toHaveAttribute('data-state', 'unchecked')
    fireEvent.keyDown(screen.getByRole('option', { name: '現金' }), { key: 'Enter' })
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('item-aligned 模式不套觸發鈕寬度；invalid 時觸發鈕帶 aria-invalid 與紅框', () => {
    render(
      <Select open defaultValue="a">
        <SelectTrigger aria-label="付款方式" invalid>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectItem value="a">現金</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByRole('listbox').className).not.toContain('w-[var(--radix-select-trigger-width)]')
    const trigger = screen.getByRole('combobox', { hidden: true })
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
    expect(trigger.className).toContain('border-danger')
  })

  it('沒有錯誤時觸發鈕不帶 aria-invalid', () => {
    render(
      <Select>
        <SelectTrigger aria-label="付款方式">
          <SelectValue placeholder="請選擇" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('請選擇')).toBeInTheDocument()
  })
})

describe('DropdownMenu（Radix）', () => {
  it('選單內容在 Portal 且帶 ui-root；danger 項目為紅字、一般項目為內文色', () => {
    const onSelect = jest.fn()
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>更多</DropdownMenuTrigger>
        <DropdownMenuContent className="extra">
          <DropdownMenuItem onSelect={onSelect}>編輯</DropdownMenuItem>
          <DropdownMenuSeparator data-testid="sep" />
          <DropdownMenuItem danger>刪除</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const menu = screen.getByRole('menu')
    expect(menu.className).toContain('ui-root')
    expect(menu.className).toContain('extra')
    expect(screen.getByRole('menuitem', { name: '刪除' }).className).toContain('text-danger')
    expect(screen.getByRole('menuitem', { name: '編輯' }).className).toContain('text-text')
    expect(screen.getByTestId('sep').className).toContain('bg-border')
    fireEvent.click(screen.getByRole('menuitem', { name: '編輯' }))
    expect(onSelect).toHaveBeenCalled()
  })
})

describe('Popover（Radix）', () => {
  it('點觸發鈕開啟、內容帶 ui-root，Esc 關閉', () => {
    render(
      <Popover>
        <PopoverTrigger>篩選</PopoverTrigger>
        <PopoverContent>
          <p>篩選條件</p>
        </PopoverContent>
      </Popover>
    )
    expect(screen.queryByText('篩選條件')).toBeNull()
    fireEvent.click(screen.getByText('篩選'))
    const content = screen.getByText('篩選條件').parentElement
    expect(content.className).toContain('ui-root')
    expect(content.className).toContain('z-[1400]')
    fireEvent.keyDown(content, { key: 'Escape' })
    expect(screen.queryByText('篩選條件')).toBeNull()
  })
})

describe('Dialog（Radix）', () => {
  it('預設寬度 sm（480），標題與說明連到 dialog 的 aria 屬性，底部列帶 className', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>刪除帳單</DialogTitle>
            <DialogDescription>刪除後無法復原</DialogDescription>
          </DialogHeader>
          <DialogBody className="body">本文</DialogBody>
          <DialogFooter className="footer">
            <button type="button">取消</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-[480px]')
    expect(dialog).toHaveAttribute('aria-describedby', screen.getByText('刪除後無法復原').id)
    expect(screen.getByText('刪除後無法復原').className).toContain('text-text-secondary')
    expect(screen.getByText('取消').parentElement.className).toContain('footer')
    // 本文區可捲動（長內容不撐破視窗）
    expect(screen.getByText('本文').className).toContain('overflow-y-auto')
    expect(screen.getByText('本文').className).toContain('body')
    expect(screen.getByLabelText('關閉')).toBeInTheDocument()
  })

  it('hideClose 時不畫右上角關閉鈕（由底部按鈕負責關閉）', () => {
    render(
      <Dialog open>
        <DialogContent size="lg" hideClose>
          <DialogTitle>大視窗</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByRole('dialog').className).toContain('max-w-[800px]')
    expect(screen.queryByLabelText('關閉')).toBeNull()
  })
})

describe('TabsContent／設定頁選單', () => {
  it('只顯示目前分頁的內容；設定選單帶 aria-label 與圖示，切換分頁呼叫 onValueChange', () => {
    const onValueChange = jest.fn()
    const Icon = props => <svg data-testid="icon" {...props} />
    render(
      <Tabs value="a" onValueChange={onValueChange} activationMode="manual">
        <SettingsTabsList className="list">
          <SettingsTabsTrigger value="a" icon={Icon}>
            基本資料
          </SettingsTabsTrigger>
          <SettingsTabsTrigger value="b">權限</SettingsTabsTrigger>
        </SettingsTabsList>
        <TabsContent value="a" className="panel">
          A 內容
        </TabsContent>
        <TabsContent value="b">B 內容</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', '設定分類')
    expect(screen.getByRole('tablist').className).toContain('list')
    expect(screen.getAllByTestId('icon')).toHaveLength(1)
    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('A 內容').className).toContain('panel')
    expect(screen.queryByText('B 內容')).toBeNull()
    const tabB = screen.getByRole('tab', { name: '權限' })
    fireEvent.mouseDown(tabB, { button: 0 })
    expect(onValueChange).toHaveBeenCalledWith('b')
  })

  it('SettingsSectionHeading 沒有標題時不輸出空的 h2', () => {
    const { container, rerender } = render(<SettingsSectionHeading />)
    expect(container.innerHTML).toBe('')
    rerender(<SettingsSectionHeading title="帳號設定" className="x" />)
    expect(screen.getByRole('heading', { name: '帳號設定' }).className).toContain('x')
  })
})
