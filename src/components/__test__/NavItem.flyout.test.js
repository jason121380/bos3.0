// 主側欄 NavItem 細項浮層的其餘互動。為什麼重要：側欄是每一頁的入口，浮層行為錯了會擋住整個操作——
// - 同時只能開一個浮層（滑到下一個群組，上一個要關，否則兩層疊在一起點不到）；
// - 滑出後在關閉延遲內滑回來要取消關閉（滑鼠從群組鈕移到浮層會短暫離開）；
// - 圖示欄點選釘住的浮層，焦點移走只收起滑過狀態、不解除釘住；
// - 群組鈕上按 Esc 關閉並把焦點留在群組鈕、不會因為這次聚焦又打開；
// - 目前頁面的連結被捲出側欄可視範圍時，自動把側欄捲到看得到的位置。
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import NavItem from '../NavItem'
import { SIDEBAR_FLYOUT_MEDIA, SidebarRailContext } from 'ui/sidebar'

const originalMedia = window.matchMedia
afterEach(() => {
  cleanup()
  window.matchMedia = originalMedia
  jest.useRealTimers()
  jest.restoreAllMocks()
})

const media = ({ hover = false, lg = false } = {}) => {
  window.matchMedia = query => ({
    matches: (hover && query === SIDEBAR_FLYOUT_MEDIA) || (lg && query === '(min-width: 1024px)'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  })
}

const group = (title, items) => (
  <NavItem
    key={title}
    depth={0}
    title={title}
    open={false}
    renderItems={() => items.map(([name, href]) => <NavItem key={href} depth={1} href={href} title={name} />)}
  />
)

const renderMenu = ({ rail = false, path = '/order/create' } = {}) =>
  render(
    <Router history={createMemoryHistory({ initialEntries: [path] })}>
      <SidebarRailContext.Provider value={rail}>
        {group('資料設定', [['系統參數設定', '/parameter']])}
        {group('員工管理', [['員工列表', '/management/employee']])}
      </SidebarRailContext.Provider>
    </Router>
  )

const groupButton = name => screen.getByRole('button', { name })
const flyout = title => screen.queryByRole('region', { name: `${title}的細項` })

describe('同時只開一個浮層', () => {
  it('滑到另一個群組時，上一個浮層立即關閉', () => {
    media({ hover: true, lg: true })
    renderMenu()
    fireEvent.mouseEnter(groupButton('資料設定').parentElement)
    expect(flyout('資料設定')).not.toBeNull()
    fireEvent.mouseEnter(groupButton('員工管理').parentElement)
    expect(flyout('員工管理')).not.toBeNull()
    expect(flyout('資料設定')).toBeNull()
  })
})

describe('滑出延遲', () => {
  it('滑出後在延遲內滑回來，浮層不關閉', () => {
    jest.useFakeTimers()
    media({ hover: true, lg: true })
    renderMenu()
    const wrapper = groupButton('資料設定').parentElement
    fireEvent.mouseEnter(wrapper)
    fireEvent.mouseLeave(wrapper)
    fireEvent.mouseEnter(wrapper)
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(flyout('資料設定')).not.toBeNull()
  })

  it('滑鼠在群組內部元素之間移動不算滑出', () => {
    jest.useFakeTimers()
    media({ hover: true, lg: true })
    renderMenu()
    const wrapper = groupButton('資料設定').parentElement
    fireEvent.mouseEnter(wrapper)
    fireEvent.mouseLeave(wrapper, { relatedTarget: groupButton('資料設定') })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(flyout('資料設定')).not.toBeNull()
  })
})

describe('圖示欄釘住的浮層', () => {
  it('焦點移到別處只收起滑過狀態，釘住的浮層留著；計時到期也不解除釘住', () => {
    jest.useFakeTimers()
    media({ lg: true })
    renderMenu({ rail: true })
    fireEvent.click(groupButton('資料設定'), { detail: 1 })
    expect(flyout('資料設定')).not.toBeNull()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    try {
      fireEvent.focusOut(groupButton('資料設定'), { relatedTarget: outside })
      fireEvent.mouseLeave(groupButton('資料設定').parentElement)
      act(() => {
        jest.advanceTimersByTime(500)
      })
      expect(flyout('資料設定')).not.toBeNull()
    } finally {
      outside.remove()
    }
  })

  it('焦點移到浮層內的連結不關閉；失焦到非元素（視窗外）時關閉鍵盤打開的浮層', () => {
    media({ lg: true })
    renderMenu({ rail: true })
    fireEvent.click(groupButton('資料設定'), { detail: 0 })
    const region = flyout('資料設定')
    const link = region.querySelector('a')
    fireEvent.focusOut(groupButton('資料設定'), { relatedTarget: link })
    expect(flyout('資料設定')).not.toBeNull()
    fireEvent.focusOut(link, { relatedTarget: null })
    expect(flyout('資料設定')).toBeNull()
  })
})

describe('鍵盤', () => {
  it('群組鈕上按 Esc 關閉浮層、焦點留在群組鈕且不會重新打開；沒有浮層時 Esc 不攔截', () => {
    media({ hover: true, lg: true })
    renderMenu()
    const button = groupButton('資料設定')
    act(() => button.focus())
    expect(flyout('資料設定')).not.toBeNull()
    fireEvent.keyDown(button, { key: 'Escape' })
    expect(flyout('資料設定')).toBeNull()
    expect(button).toHaveFocus()
    const outer = jest.fn()
    document.addEventListener('keydown', outer)
    try {
      fireEvent.keyDown(button, { key: 'Escape' })
      expect(outer).toHaveBeenCalledTimes(1)
    } finally {
      document.removeEventListener('keydown', outer)
    }
  })

  it('浮層內按其他鍵不關閉', () => {
    media({ hover: true, lg: true })
    renderMenu()
    fireEvent.mouseEnter(groupButton('資料設定').parentElement)
    fireEvent.keyDown(flyout('資料設定').querySelector('a'), { key: 'ArrowDown' })
    expect(flyout('資料設定')).not.toBeNull()
  })

  it('不用浮層的群組（窄屏內嵌）失焦時不做事', () => {
    media()
    renderMenu()
    fireEvent.click(groupButton('資料設定'))
    expect(screen.getByRole('link', { name: '系統參數設定' })).toBeInTheDocument()
    fireEvent.focusOut(groupButton('資料設定'), { relatedTarget: document.body })
    expect(screen.getByRole('link', { name: '系統參數設定' })).toBeInTheDocument()
  })
})

describe('目前頁面捲進側欄可視範圍', () => {
  const box = (top, bottom) => ({ top, bottom, left: 0, right: 200, width: 200, height: bottom - top, x: 0, y: top })

  // 側欄目前捲在 200px；記錄被設定的新捲動位置
  const renderActive = linkBox => {
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      return this.tagName === 'NAV' ? box(100, 500) : linkBox
    })
    jest.spyOn(Element.prototype, 'scrollTop', 'get').mockReturnValue(200)
    const setScroll = jest.spyOn(Element.prototype, 'scrollTop', 'set').mockImplementation(() => {})
    render(
      <Router history={createMemoryHistory({ initialEntries: ['/parameter'] })}>
        <nav>
          <NavItem depth={1} href="/parameter" title="系統參數設定" />
        </nav>
      </Router>
    )
    return setScroll
  }

  it('在可視範圍上方時往上捲到露出（多留 8px）', () => {
    const setScroll = renderActive(box(40, 76))
    expect(setScroll).toHaveBeenCalledWith(200 - (100 - 40 + 8))
  })

  it('在可視範圍下方時往下捲到露出（多留 8px）', () => {
    const setScroll = renderActive(box(560, 596))
    expect(setScroll).toHaveBeenCalledWith(200 + (596 - 500 + 8))
  })

  it('已在可視範圍內時不捲動', () => {
    const setScroll = renderActive(box(200, 236))
    expect(setScroll).not.toHaveBeenCalled()
  })
})
