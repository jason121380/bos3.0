import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import NavItem, { isWithinHref } from '../NavItem'
import { SIDEBAR_FLYOUT_MEDIA, SidebarRailContext } from 'ui/sidebar'

afterEach(cleanup)

// 與 layouts/Dashboard/NavBar 的 reduceChildRoutes 相同：群組 open＝子項 href 為目前網址的前綴
const Group = ({ pathname }) => {
  const items = [
    { title: '客戶列表', href: '/management/customers' },
    { title: '客資篩選匯出', href: '/management/customer-filter-export' },
  ]
  return (
    <NavItem depth={0} title="客戶管理" open={items.some(item => isWithinHref(pathname, item.href))}>
      <div>
        {items.map(item => (
          <NavItem key={item.href} depth={1} href={item.href} title={item.title} />
        ))}
      </div>
    </NavItem>
  )
}

const setup = path => {
  const history = createMemoryHistory({ initialEntries: [path] })
  const App = () => {
    const [pathname, setPathname] = React.useState(history.location.pathname)
    React.useEffect(() => history.listen(location => setPathname(location.pathname)), [])
    return <Group pathname={pathname} />
  }
  render(
    <Router history={history}>
      <App />
    </Router>
  )
  return history
}

describe('側欄揭露目前位置', () => {
  it('isWithinHref 以路徑段為界比對，不會把 /productsX 當成 /products 的子頁', () => {
    expect(isWithinHref('/management/customers', '/management/customers')).toBe(true)
    expect(isWithinHref('/management/customers/12/general', '/management/customers')).toBe(true)
    expect(isWithinHref('/management/customers-export', '/management/customers')).toBe(false)
    expect(isWithinHref('/products', undefined)).toBe(false)
  })

  it('子頁（顧客詳細）自動展開群組並以 aria-current 標示所在區段；手動收合有效，換頁後再展開', () => {
    const history = setup('/management/customers/12/general')
    const group = screen.getByRole('button', { name: '客戶管理' })
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: '客戶列表' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: '客資篩選匯出' })).not.toHaveAttribute('aria-current')

    fireEvent.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'false')

    act(() => history.push('/management/customers'))
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: '客戶列表' })).toHaveAttribute('aria-current', 'page')
  })

  it('目前頁面不在群組內時維持收合', () => {
    setup('/order/create')
    expect(screen.getByRole('button', { name: '客戶管理' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: '客戶列表' })).toBeNull()
  })
})

const hoverMedia = matches => {
  window.matchMedia = query => ({
    matches: matches && (query === SIDEBAR_FLYOUT_MEDIA || query === '(min-width: 1024px)'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    removeListener() {},
  })
}

describe('主側欄桌機 hover 細項', () => {
  const original = window.matchMedia

  afterEach(() => {
    window.matchMedia = original
  })

  const renderGroup = ({ rail = false } = {}) => {
    const history = createMemoryHistory({ initialEntries: ['/order/create'] })
    const items = [
      { title: '服務分類設定', href: '/service/categories' },
      { title: '系統參數設定', href: '/parameter' },
    ]
    render(
      <Router history={history}>
        <SidebarRailContext.Provider value={rail}>
          <NavItem
            depth={0}
            title="資料設定"
            open={false}
            renderItems={() => items.map(item => (
              <NavItem key={item.href} depth={1} href={item.href} title={item.title} />
            ))}
          />
        </SidebarRailContext.Provider>
      </Router>
    )
    return history
  }

  it('桌機滑過有子項的主選單會浮出細項，移出後關閉；點主項不再上下開合', async () => {
    hoverMedia(true)
    const history = renderGroup()
    const group = screen.getByRole('button', { name: '資料設定' })
    expect(group).toHaveAttribute('aria-expanded', 'false')
    expect(group).toHaveAttribute('aria-haspopup', 'true')
    expect(group.querySelector('svg')).toBeNull()
    fireEvent.mouseEnter(group.parentElement)
    const flyout = screen.getByRole('region', { name: '資料設定的細項' })
    expect(flyout.querySelector('.rounded-2xl')).not.toBeNull()
    const link = withinFlyout(flyout, '系統參數設定')
    expect(link.className).toContain('rounded-md')
    expect(link.className).toContain('text-body')
    fireEvent.click(link)
    expect(history.location.pathname).toBe('/parameter')
    fireEvent.mouseLeave(group.parentElement)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
    })
    expect(screen.queryByRole('region', { name: '資料設定的細項' })).toBeNull()
    // 滑鼠點主項（detail > 0）不上下開合也不釘住浮層
    fireEvent.click(group, { detail: 1 })
    expect(group).toHaveAttribute('aria-expanded', 'false')
    expect(group.parentElement.querySelector('a')).toBeNull()
    expect(screen.queryByRole('region', { name: '資料設定的細項' })).toBeNull()
  })

  it('鍵盤：Tab 到群組鈕按 Enter 打開浮層並把焦點移進第一個細項，Esc 關閉並回到群組鈕', () => {
    hoverMedia(true)
    renderGroup()
    const group = screen.getByRole('button', { name: '資料設定' })
    act(() => group.focus())
    // 焦點停在群組鈕就先浮出（與滑鼠滑過相同），但焦點不移動
    expect(screen.getByRole('region', { name: '資料設定的細項' })).toBeInTheDocument()
    expect(document.activeElement).toBe(group)
    // Enter／空白鍵在瀏覽器會觸發 detail 為 0 的 click
    fireEvent.click(group, { detail: 0 })
    const flyout = screen.getByRole('region', { name: '資料設定的細項' })
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(group).toHaveAttribute('aria-controls', flyout.id)
    expect(document.activeElement).toBe(withinFlyout(flyout, '服務分類設定'))
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: '資料設定的細項' })).toBeNull()
    expect(document.activeElement).toBe(group)
    // 再按一次 Enter 打開，焦點移到浮層外（例如主內容）就關閉
    fireEvent.click(group, { detail: 0 })
    expect(screen.getByRole('region', { name: '資料設定的細項' })).toBeInTheDocument()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    fireEvent.focusOut(document.activeElement, { relatedTarget: outside })
    expect(screen.queryByRole('region', { name: '資料設定的細項' })).toBeNull()
    outside.remove()
  })

  it('桌機 hover 時搜尋強制展開仍把子項嵌進側欄，不另開浮層', () => {
    hoverMedia(true)
    const history = createMemoryHistory({ initialEntries: ['/order/create'] })
    render(
      <Router history={history}>
        <NavItem
          depth={0}
          title="資料設定"
          open
          forceOpen
          renderItems={() => (
            <div>
              <NavItem depth={1} href="/parameter" title="系統參數設定" />
            </div>
          )}
        />
      </Router>
    )
    expect(screen.getByRole('link', { name: '系統參數設定' })).toBeInTheDocument()
    expect(screen.queryByRole('region')).toBeNull()
    fireEvent.mouseEnter(screen.getByRole('button', { name: '資料設定' }).parentElement)
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('窄屏或觸控不靠 hover 浮出；圖示欄改以點選打開細項', () => {
    hoverMedia(false)
    renderGroup()
    fireEvent.mouseEnter(screen.getByRole('button', { name: '資料設定' }).parentElement)
    expect(screen.queryByRole('region')).toBeNull()

    cleanup()
    hoverMedia(false)
    window.matchMedia = query => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      addEventListener() {},
      removeEventListener() {},
      removeListener() {},
    })
    renderGroup({ rail: true })
    fireEvent.mouseEnter(screen.getByRole('button', { name: '資料設定' }).parentElement)
    expect(screen.queryByRole('region')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '資料設定' }))
    expect(screen.getByRole('region', { name: '資料設定的細項' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '資料設定' }))
    expect(screen.queryByRole('region', { name: '資料設定的細項' })).toBeNull()
  })
})

function withinFlyout(flyout, name) {
  return Array.from(flyout.querySelectorAll('a')).find(el => el.textContent === name)
}
