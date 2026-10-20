
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
import { Integrations } from '@sentry/tracing'

import GoogleAnalytics from './components/GoogleAnalytics'
import ScrollReset from './components/ScrollReset'
import routes from './routes'
import TeachingModeState from './context/TeachingModeState'
import { detectApiEnv } from './lib/api-base'
import { APP_VERSION } from './version'

const history = createBrowserHistory()

// 錯誤追蹤（Sentry）：只在正式 build 送出；依連線的後端標記環境，並以畫面版號當 release，
// 讓錯誤能對應到是哪一版。效能追蹤取樣 10%（原 100% 會為每次換頁、每支請求都上傳一筆 transaction）。
const isProductionBuild = process.env.NODE_ENV === 'production'
Sentry.init({
  dsn: 'https://7bc089052abd4624910f289209840fd9@o251287.ingest.sentry.io/5542421',
  enabled: isProductionBuild,
  environment: isProductionBuild ? (detectApiEnv() === 'test' ? 'staging' : 'production') : 'development',
  release: `bos@${APP_VERSION}`,
  integrations: [new Integrations.BrowserTracing()],
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
