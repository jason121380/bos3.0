// 保護什麼：路由表（src/routes.js 與 src/dashboardRoutes.js）。
// - 結構：每條路由都有 component；同一層的 path 不重複（重複時後面那條永遠比對不到）；
//   後台萬用路由（route: '*'）必須是最後一筆，其子路由的最後一筆是不帶 path 的 404 導向（新增路由要放在它之前）。
// - 登入頁群組、錯誤頁群組最後也是 404 導向；首頁 / 導向打帳單。
// - 延遲載入（lazy）的每一頁都指到真的存在的模組：這裡把 views 模組換成替身逐一載入，模組不存在時 jest.doMock 會直接報錯。
// - /ui-preview 只在非正式建置存在。
import fs from 'fs'
import path from 'path'
import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Redirect, Route, Switch } from 'react-router-dom'

const SRC = path.join(__dirname, '..')
const lazyTargets = file => [...fs.readFileSync(path.join(SRC, file), 'utf8').matchAll(/import\('([^']+)'\)/g)].map(m => m[1])

// views 模組替身：載入時回傳一個可辨識的元件（不載入真正的頁面與其相依）
const targets = [...new Set([...lazyTargets('routes.js'), ...lazyTargets('dashboardRoutes.js')])]
targets.forEach(target => {
  jest.doMock(target, () => ({ __esModule: true, default: () => React.createElement('span', null, `頁面:${target}`) }))
})

const routes = require('../routes').default
const dashboardRoutes = require('../dashboardRoutes').default

const isLazy = c => c && c.$$typeof === Symbol.for('react.lazy')
const walk = (list, visit, depth = 0) =>
  list.forEach(r => {
    visit(r, depth)
    if (r.routes) walk(r.routes, visit, depth + 1)
  })

describe('路由表結構', () => {
  it('每條路由都有 component；同一層的 path 不重複', () => {
    const check = list => {
      const paths = list.filter(r => r.path).map(r => r.path)
      expect(paths.filter((p, i) => paths.indexOf(p) !== i)).toEqual([])
      list.forEach(r => {
        expect(r.component).toBeTruthy()
        if (r.routes) check(r.routes)
      })
    }
    check(routes)
  })

  it('後台萬用路由是最後一筆，子路由就是 dashboardRoutes，且最後一筆是 404 導向', () => {
    const last = routes[routes.length - 1]
    expect(last.route).toBe('*')
    expect(last.routes).toBe(dashboardRoutes)
    const fallback = dashboardRoutes[dashboardRoutes.length - 1]
    expect(fallback.path).toBeUndefined()
    expect(dashboardRoutes.slice(0, -1).every(r => r.path)).toBe(true)
    const { container } = render(<MemoryRouter>{React.createElement(fallback.component)}</MemoryRouter>)
    expect(container.innerHTML).toBe('')
    expect(fallback.component().type).toBe(Redirect)
    expect(fallback.component().props.to).toBe('/errors/error-404')
  })

  it('首頁導向打帳單；登入與錯誤頁群組最後一筆是 404 導向', () => {
    const home = routes.find(r => r.path === '/')
    expect(home.exact).toBe(true)
    expect(home.component().props.to).toBe('/order/create')
    ;['/auth', '/errors'].forEach(p => {
      const group = routes.find(r => r.path === p).routes
      const fallback = group[group.length - 1]
      expect(fallback.path).toBeUndefined()
      expect(fallback.component().props.to).toBe('/errors/error-404')
    })
  })

  it('後台路由除 404 導向外都是 exact（避免 /services 吃掉 /services/create）', () => {
    expect(dashboardRoutes.filter(r => r.path && !r.exact).map(r => r.path)).toEqual([])
  })

  it('帳務明細舊拼字路徑導向正確路徑，書籤仍可用', () => {
    const cases = [
      ['/accounting/deatil/:id', '/accounting/detail/:id', '/accounting/detail/mf-1', 'mf-1'],
      ['/general/accounting/deatil/:id', '/general/accounting/detail/:id', '/general/accounting/detail/mf-1', 'mf-1'],
    ]
    cases.forEach(([legacyPath, canonicalPath, to, id]) => {
      const legacy = dashboardRoutes.find(r => r.path === legacyPath)
      const canonical = dashboardRoutes.find(r => r.path === canonicalPath)
      expect(isLazy(canonical.component)).toBe(true)
      const node = legacy.component({ match: { params: { id } } })
      expect(node.type).toBe(Redirect)
      expect(node.props.to).toBe(to)
    })
  })

  it('設計師業績分析表舊拼字網址導向正確網址，書籤仍可用', () => {
    const legacy = dashboardRoutes.find(r => r.path === '/designer-perforamnce-analyze-report')
    const canonical = dashboardRoutes.find(r => r.path === '/designer-performance-analyze-report')
    expect(legacy.exact).toBe(true)
    expect(isLazy(canonical.component)).toBe(true)
    const node = legacy.component()
    expect(node.type).toBe(Redirect)
    expect(node.props.to).toBe('/designer-performance-analyze-report')
    let location
    render(
      <MemoryRouter initialEntries={['/designer-perforamnce-analyze-report']}>
        <Switch>
          <Route path={legacy.path} exact component={legacy.component} />
          <Route render={props => { location = props.location; return null }} />
        </Switch>
      </MemoryRouter>
    )
    expect(location.pathname).toBe('/designer-performance-analyze-report')
  })
})

describe('延遲載入的頁面', () => {
  it('每個 lazy 路由都載入得到對應的 views 模組', async () => {
    const lazies = []
    walk(routes, r => {
      if (isLazy(r.component)) lazies.push(r.component)
    })
    // 路由外另外包一層 Suspense 的（AR2、UiPreview）與顧客端頁面在 routes.js 頂端宣告
    expect(lazies.length).toBeGreaterThan(150)
    const loaded = await Promise.all(lazies.map(l => l._payload._result()))
    loaded.forEach(mod => expect(typeof mod.default).toBe('function'))
    const names = loaded.map(mod => mod.default().props.children)
    expect(names).toContain('頁面:views/OrderCreate')
    expect(names).toContain('頁面:views/Login')
    expect(names).toContain('頁面:layouts/DashBoardListDetail')
  })

  it('AR2 與 UiPreview 外包 Suspense，可直接當頂層路由渲染', async () => {
    const ar = routes.find(r => r.path === '/ar')
    const preview = routes.find(r => r.path === '/ui-preview')
    const { findByText } = render(
      <MemoryRouter>
        {React.createElement(ar.component)}
        {React.createElement(preview.component)}
      </MemoryRouter>
    )
    expect(await findByText('頁面:views/AR2')).toBeInTheDocument()
    expect(await findByText('頁面:views/UiPreview')).toBeInTheDocument()
    expect(routes.find(r => r.path === '/ar2').component).toBe(ar.component)
  })
})

describe('正式建置', () => {
  it('不包含 /ui-preview（元件預覽頁只在開發時存在）', () => {
    const env = process.env.NODE_ENV
    let prodRoutes
    try {
      process.env.NODE_ENV = 'production'
      jest.isolateModules(() => {
        prodRoutes = require('../routes').default
      })
    } finally {
      process.env.NODE_ENV = env
    }
    expect(prodRoutes.find(r => r.path === '/ui-preview')).toBeUndefined()
    expect(routes.find(r => r.path === '/ui-preview')).toBeDefined()
    expect(prodRoutes).toHaveLength(routes.length - 1)
  })
})
