import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { createUploadLink } from 'apollo-upload-client'
import { openSnackbar } from 'elements/snackbars'
import { getGraphqlUrl } from './api-base'
import { beginRequest } from './after-first-load'
import { httpStatusMessage } from './friendly-error'
import { settingsCacheLink, bindSettingsCache } from './settings-cache'
import { clearEngineeringUnlock } from 'helper/engineeringMode'

// 網路錯誤提示的節流間隔：斷線時多支查詢同時失敗，只提示一次
const NETWORK_ERROR_NOTICE_INTERVAL = 5000
let lastNetworkErrorNoticeAt = 0

export function networkErrorMessage(networkError) {
  const statusCode = networkError && networkError.statusCode
  if (statusCode) return httpStatusMessage(statusCode)
  return '網路連線異常，請檢查網路後再試一次'
}

export function handleApolloError({ graphQLErrors, networkError }) {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      const code = extensions && extensions.code
      if (code === 'TKN_ERROR') {
        clearEngineeringUnlock()
        localStorage.clear()
        window.location.href = '/auth/login'
        return
      }
      if (code === 'TKN_IN_JAIL') {
        alert(message)
        return
      }
      openSnackbar({ message, variant: 'error' })
    })
  }
  // 原本網路錯誤只寫 console，使用者斷線時看不到任何提示、按鈕停在處理中
  if (networkError) {
    const now = Date.now()
    if (now - lastNetworkErrorNoticeAt > NETWORK_ERROR_NOTICE_INTERVAL) {
      lastNetworkErrorNoticeAt = now
      openSnackbar({ message: networkErrorMessage(networkError), variant: 'error' })
    }
  }
}

export function buildAuthHeaders(headers) {
  const userMerchant = JSON.parse(localStorage.getItem('userMerchant') || 'null')
  const usermerchantid = userMerchant && userMerchant.id
  const token = localStorage.getItem('token')
  return {
    ...headers,
    ...(usermerchantid ? { usermerchantid } : {}),
    ...(token ? { accesstoken: token } : {}),
  }
}

const errorLink = onError(handleApolloError)
// 只計數、不改內容：統計還在等回應的查詢，首屏延後的查詢要等「沒有查詢在等回應」才發出（lib/after-first-load）
export const inflightLink = new ApolloLink((operation, forward) => {
  const end = beginRequest()
  return new Observable(observer => {
    const subscription = forward(operation).subscribe({
      next: value => observer.next(value),
      error: error => {
        end()
        observer.error(error)
      },
      complete: () => {
        end()
        observer.complete()
      },
    })
    return () => {
      end()
      subscription.unsubscribe()
    }
  })
})
const authLink = setContext((_, { headers }) => ({ headers: buildAuthHeaders(headers) }))
const httpLink = createUploadLink({
  uri: getGraphqlUrl(),
  headers: { 'Apollo-Require-Preflight': 'true' },
})

// client 設定（測試以假 link 驗證 loading 行為與 v2 相同，見 __tests__/apollo-loading.test.js）。
// 不要加 defaultOptions.watchQuery.notifyOnNetworkStatusChange：會讓 cache-first／network-only 的 refetch 多出 loading 變化，與原本不同
export function createApolloClient(link) {
  return new ApolloClient({ link, cache: new InMemoryCache({ addTypename: false }) })
}

let apolloClient = null

// 整個 App 共用一個 client。原本的 SSR 判斷（process.browser）在瀏覽器恆為 undefined，
// 每次呼叫都新建 client，啟動時會建出兩個 client 與兩份 cache。
export default function initApollo() {
  if (!apolloClient) {
    // settingsCacheLink：設定類查詢改 cache-first 後，mutation 成功就清除設定快取（見 lib/settings-cache）
    apolloClient = createApolloClient(settingsCacheLink.concat(inflightLink).concat(authLink).concat(errorLink).concat(httpLink))
    bindSettingsCache(apolloClient.cache)
  }
  return apolloClient
}
