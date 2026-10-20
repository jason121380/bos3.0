
import 'react-perfect-scrollbar/dist/css/styles.css'

import './mixins/validate'
import './mixins/prismjs'
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

// MUIv5 theme and locale setting
// 樣式設定
import { ThemeProvider } from '@mui/material'
import { theme } from './theme'

// import ReactGA from 'react-ga'

const history = createBrowserHistory()

// const TRACKING_ID = 'G-Y4KX6NT6NX'
// ReactGA.initialize(TRACKING_ID)
// ReactGA.pageview(window.location.pathname)

// Tracking errors by Sentry
Sentry.init({
  dsn: 'https://7bc089052abd4624910f289209840fd9@o251287.ingest.sentry.io/5542421',
  integrations: [new Integrations.BrowserTracing()],
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
})

function App() {
  return (
    <ApolloProvider client={client()}>
      <ThemeProvider theme={theme}>
        <TeachingModeState>
          <Router history={history}>
            <ScrollReset />
            <GoogleAnalytics />
            {renderRoutes(routes)}
            <div id="modal" />
          </Router>
        </TeachingModeState>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
