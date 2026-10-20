import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import React from 'react'
import { Router } from 'react-router-dom'

import NavItem, { isWithinHref } from '../NavItem'

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
