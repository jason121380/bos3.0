// 保護什麼：App 根元件與錯誤追蹤（Sentry）設定。
// - Sentry 只在正式 build 送出（開發與測試不送），環境依連線的後端標記（正式站／測試站），release 帶畫面版號，
//   效能追蹤取樣 10%（原 100% 每次換頁都上傳）。
// - App 以 Apollo、Router 包住路由表，並保留 #modal 掛載點（舊彈窗以 Portal 掛在這裡）。
import React from 'react'
import { render } from '@testing-library/react'
import { ApolloClient, ApolloLink, InMemoryCache, useApolloClient } from '@apollo/client'
import { APP_VERSION } from '../version'

const mockSentry = { init: jest.fn(), browserTracingIntegration: jest.fn(() => 'tracing') }
jest.mock('@sentry/react', () => mockSentry)
const mockClient = new ApolloClient({ cache: new InMemoryCache(), link: ApolloLink.empty() })
jest.mock('lib/with-apollo-client', () => ({ client: () => mockClient }))
jest.mock('components/GoogleAnalytics', () => () => null)
jest.mock('components/ScrollReset', () => () => null)
// 路由表換成最小替身：驗證 App 會把它交給 renderRoutes，並提供 Apollo client
const Home = () => {
  const client = useApolloClient()
  return <p>{client === mockClient ? '首頁（有 Apollo）' : '首頁'}</p>
}
jest.mock('../routes', () => [{ path: '/', exact: true, component: Home }])

const loadApp = nodeEnv => {
  const env = process.env.NODE_ENV
  let App
  mockSentry.init = jest.fn()
  mockSentry.browserTracingIntegration = jest.fn(() => 'tracing')
  try {
    process.env.NODE_ENV = nodeEnv
    jest.isolateModules(() => {
      App = require('../App').default
    })
  } finally {
    process.env.NODE_ENV = env
  }
  return App
}

describe('Sentry 錯誤追蹤', () => {
  it('開發／測試環境不送出，環境標記為 development', () => {
    loadApp('test')
    expect(mockSentry.init).toHaveBeenCalledTimes(1)
    expect(mockSentry.init.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        enabled: false,
        environment: 'development',
        release: `bos@${APP_VERSION}`,
        tracesSampleRate: 0.1,
        integrations: ['tracing'],
      })
    )
  })

  it('正式 build 才送出，環境依連線的後端標記', () => {
    loadApp('production')
    const options = mockSentry.init.mock.calls[0][0]
    expect(options.enabled).toBe(true)
    expect(['production', 'staging']).toContain(options.environment)
  })
})

describe('App', () => {
  it('以 Apollo 與 Router 包住路由表，並保留 #modal 掛載點', () => {
    // 與測試同一份 React（isolateModules 會載入另一份 React，不能拿來渲染）
    const App = require('../App').default
    const { getByText, container } = render(<App />)
    expect(getByText('首頁（有 Apollo）')).toBeInTheDocument()
    expect(container.querySelector('#modal')).not.toBeNull()
  })
})
