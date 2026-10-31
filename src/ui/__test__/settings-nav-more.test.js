// 設定頁左側選單（SettingsTabsList）的「捲動時固定在可視區」其餘情況。
// 為什麼重要：#printContainer 的 overflow-x:hidden 讓 CSS sticky 失效，桌機靠這段把選單改 fixed；
// 列印時、手機、量不到尺寸時一定要回到文件流（否則列印稿上選單蓋住內容、手機選單浮在畫面上），
// 版面尺寸改變（側欄收合、內容變長）要重新量；卸載時要拆掉所有監聽。
import React from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { Tabs } from '../tabs'
import { SettingsSectionHeading, SettingsTabsList, SettingsTabsTrigger } from '../settings-nav'

const originalMedia = window.matchMedia
const originalRect = Element.prototype.getBoundingClientRect
const originalResizeObserver = window.ResizeObserver

let media
let rects
const observers = []
class FakeResizeObserver {
  constructor(callback) {
    this.callback = callback
    this.observed = []
    this.disconnect = jest.fn()
    observers.push(this)
  }
  observe(node) {
    this.observed.push(node)
  }
}

beforeEach(() => {
  media = { desktop: true, print: false, legacy: false }
  rects = {
    slot: { top: -80, left: 300, width: 240, height: 200 },
    list: { top: -80, left: 300, width: 240, height: 200 },
    parent: { top: -80, left: 280, width: 720, height: 1680 },
  }
  observers.length = 0
  window.matchMedia = query => {
    const matches = query === 'print' ? media.print : query === '(min-width: 768px)' && media.desktop
    if (media.legacy) return { matches, media: query }
    return { matches, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() }
  }
  Element.prototype.getBoundingClientRect = function readRect() {
    const key = this.getAttribute('role') === 'tablist' ? 'list' : this.hasAttribute('data-settings-nav') ? 'slot' : 'parent'
    const r = rects[key]
    return { ...r, bottom: r.top + r.height, right: r.left + r.width, x: r.left, y: r.top }
  }
  window.ResizeObserver = FakeResizeObserver
})

afterEach(() => {
  cleanup()
  window.matchMedia = originalMedia
  Element.prototype.getBoundingClientRect = originalRect
  window.ResizeObserver = originalResizeObserver
})

const renderNav = (props = {}, wrapper) => {
  const nav = (
    <Tabs value="a" onValueChange={() => {}}>
      <SettingsTabsList {...props}>
        <SettingsTabsTrigger value="a">打帳單</SettingsTabsTrigger>
      </SettingsTabsList>
    </Tabs>
  )
  return render(wrapper ? wrapper(nav) : nav)
}
const scroll = () =>
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })

describe('SettingsTabsList 固定在可視區', () => {
  it('列印時回到文件流（列印稿不能有浮動選單）', () => {
    renderNav()
    expect(screen.getByRole('tablist').style.position).toBe('fixed')
    media.print = true
    act(() => {
      window.dispatchEvent(new Event('beforeprint'))
    })
    expect(screen.getByRole('tablist').style.position).toBe('')
  })

  it('窄屏時不固定；沒有固定時沿用呼叫端的 style', () => {
    media.desktop = false
    renderNav({ style: { color: 'red' } })
    expect(screen.getByRole('tablist').style.position).toBe('')
    expect(screen.getByRole('tablist').style.color).toBe('red')
    // 已經不是固定狀態時再量一次，維持同一份狀態
    scroll()
    expect(screen.getByRole('tablist').style.position).toBe('')
  })

  it('量不到選單高度時改用欄位高度、量不到欄位寬度時改用選單寬度', () => {
    rects.list = { ...rects.list, height: 0 }
    rects.slot = { ...rects.slot, width: 0 }
    renderNav()
    const list = screen.getByRole('tablist')
    expect(list.style.position).toBe('fixed')
    expect(list.style.width).toBe('240px')
    expect(list.parentElement.style.minHeight).toBe('200px')
  })

  it('寬高都量不到（尚未排版）時不固定', () => {
    rects.list = { ...rects.list, height: 0, width: 0 }
    rects.slot = { ...rects.slot, height: 0, width: 0 }
    renderNav()
    expect(screen.getByRole('tablist').style.position).toBe('')
  })

  it('父層底部已經捲過選單時不固定（避免蓋到下一段內容）', () => {
    rects.parent = { ...rects.parent, top: -1500, height: 1600 }
    renderNav()
    expect(screen.getByRole('tablist').style.position).toBe('')
  })

  it('捲動時位置沒變（差距小於半像素）沿用同一份狀態；位置改變時更新', () => {
    renderNav()
    const list = screen.getByRole('tablist')
    rects.slot = { ...rects.slot, left: 300.2 }
    scroll()
    expect(list.style.left).toBe('300px')
    rects.slot = { ...rects.slot, left: 320 }
    scroll()
    expect(list.style.left).toBe('320px')
  })

  it('觀察主內容區與欄位尺寸；尺寸改變時重新量，卸載時中止觀察', () => {
    const main = document.createElement('div')
    main.id = 'main-content'
    document.body.appendChild(main)
    try {
      const { unmount } = renderNav()
      expect(observers).toHaveLength(1)
      expect(observers[0].observed[0]).toBe(main)
      expect(observers[0].observed[1]).toHaveAttribute('data-settings-nav')
      rects.slot = { ...rects.slot, left: 360 }
      act(() => observers[0].callback())
      expect(screen.getByRole('tablist').style.left).toBe('360px')
      unmount()
      expect(observers[0].disconnect).toHaveBeenCalled()
    } finally {
      main.remove()
    }
  })

  it('沒有主內容區時只觀察欄位；瀏覽器沒有 ResizeObserver 時不觀察也不出錯', () => {
    renderNav()
    expect(observers[0].observed).toHaveLength(1)
    cleanup()
    delete window.ResizeObserver
    expect(() => renderNav().unmount()).not.toThrow()
  })

  it('舊版 Safari 的 matchMedia 沒有 addEventListener 時仍可運作', () => {
    media.legacy = true
    const { unmount } = renderNav()
    expect(screen.getByRole('tablist').style.position).toBe('fixed')
    expect(() => unmount()).not.toThrow()
  })

  it('沒有 matchMedia 的環境不固定', () => {
    delete window.matchMedia
    renderNav()
    expect(screen.getByRole('tablist').style.position).toBe('')
  })

  it('轉發 ref：物件與函式 ref 都拿到選單', () => {
    const objectRef = React.createRef()
    renderNav({ ref: objectRef })
    expect(objectRef.current).toBe(screen.getByRole('tablist'))
    cleanup()
    const fnRef = jest.fn()
    renderNav({ ref: fnRef })
    expect(fnRef).toHaveBeenCalledWith(screen.getByRole('tablist'))
  })
})

describe('SettingsSectionHeading', () => {
  it('有標題才顯示分段標題', () => {
    const { container } = render(<SettingsSectionHeading title="" />)
    expect(container.innerHTML).toBe('')
    render(<SettingsSectionHeading title="帳單設定" />)
    expect(screen.getByRole('heading', { name: '帳單設定' })).toBeInTheDocument()
  })
})
