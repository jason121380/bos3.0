
import 'react-perfect-scrollbar/dist/css/styles.css'

import './mixins/validate'
import './assets/scss/main.scss'
import './styles/tokens.css'
// import './initialize.scss'

import { ApolloProvider } from '@apollo/client'
import { createBrowserHistory } from 'history'
import { client } from 'lib/with-apollo-client'
import React from 'react'
import { renderRoutes } from 'react-router-config'
import { Router } from 'react-router-dom'
import * as Sentry from '@sentry/react'

import GoogleAnalytics from './components/GoogleAnalytics'
import ScrollReset from './components/ScrollReset'
import routes from './routes'
import TeachingModeState from './context/TeachingModeState'
import { getApiEnvironment } from './lib/api-base'
import { APP_VERSION } from './version'

const history = createBrowserHistory()

// 錯誤追蹤（Sentry）：只在正式 build 送出；依連線的後端標記環境，並以畫面版號當 release，
// 讓錯誤能對應到是哪一版。效能追蹤取樣 10%（原 100% 會為每次換頁、每支請求都上傳一筆 transaction）。
const isProductionBuild = process.env.NODE_ENV === 'production'
Sentry.init({
  dsn: 'https://7bc089052abd4624910f289209840fd9@o251287.ingest.sentry.io/5542421',
  enabled: isProductionBuild,
  environment: isProductionBuild ? getApiEnvironment() : 'development',
  release: `bos@${APP_VERSION}`,
  // Sentry 8 起 BrowserTracing 改為函式形式並併入 @sentry/react（2026/10/21 自 6 升到 10——11 版不支援 Safari 14；不再需要 @sentry/tracing）；
  // 預設只對同網域請求加追蹤標頭，與 6 版相同，不會對後端 API 多送 sentry-trace 標頭
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
})

function App() {
  return (
    <ApolloProvider client={client()}>
      <TeachingModeState>
        <Router history={history}>
          <ScrollReset />
          <GoogleAnalytics />
          {renderRoutes(routes)}
          <div id="modal" />
        </Router>
      </TeachingModeState>
    </ApolloProvider>
  )
}

export default App
