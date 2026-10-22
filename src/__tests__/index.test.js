// 保護什麼：入口檔 src/index.js 的啟動順序（CLAUDE.md 架構速記）：
// - lib/polyfills、lib/immer-config、lib/install-business-timezone 必須在 App 與 store 之前載入
//   （台灣時間要在任何頁面算日期前生效；immer 凍結行為要在任何 produce 之前設定）。
// - 啟動時就地瘦身舊版存的登入資料（sanitizeStoredUser）、移除已安裝的 service worker，再把 App 渲染到 #root（外層包 Redux Provider）。
const mockOrder = []
jest.mock('../lib/polyfills', () => mockOrder.push('polyfills'))
jest.mock('../lib/immer-config', () => mockOrder.push('immer-config'))
jest.mock('../lib/install-business-timezone', () => mockOrder.push('install-business-timezone'))
jest.mock('../lib/stored-user', () => {
  mockOrder.push('stored-user')
  return { sanitizeStoredUser: () => mockOrder.push('sanitizeStoredUser()') }
})
jest.mock('../store/index', () => {
  mockOrder.push('store')
  return { __esModule: true, default: { getState: () => ({}), subscribe: () => () => {}, dispatch: () => {} } }
})
jest.mock('../App', () => {
  mockOrder.push('App')
  return { __esModule: true, default: () => null }
})
jest.mock('../serviceWorker', () => ({ unregister: () => mockOrder.push('unregister()') }))
jest.mock('react-dom', () => ({ ...jest.requireActual('react-dom'), render: (element, container) => mockOrder.push({ element, container }) }))

it('先載入 polyfills／immer 設定／台灣時區，再載入 store 與 App；瘦身登入資料、移除 service worker 後渲染到 #root', () => {
  const root = document.createElement('div')
  root.id = 'root'
  document.body.appendChild(root)
  jest.isolateModules(() => {
    require('../index')
  })
  const names = mockOrder.map(x => (typeof x === 'string' ? x : 'render'))
  const at = name => names.indexOf(name)
  expect(at('polyfills')).toBe(0)
  expect(at('immer-config')).toBe(1)
  expect(at('install-business-timezone')).toBe(2)
  expect(at('store')).toBeGreaterThan(2)
  expect(at('App')).toBeGreaterThan(2)
  expect(at('sanitizeStoredUser()')).toBeGreaterThan(at('App'))
  expect(at('unregister()')).toBeGreaterThan(at('sanitizeStoredUser()'))
  expect(names[names.length - 1]).toBe('render')
  const { element, container } = mockOrder[mockOrder.length - 1]
  expect(container).toBe(root)
  // 外層是 Redux Provider，裡面是 App
  expect(element.props.store).toBeDefined()
  expect(element.props.children.type).toBeInstanceOf(Function)
  root.remove()
})
