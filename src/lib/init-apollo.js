import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { ApolloLink, Observable } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { createUploadLink } from 'apollo-upload-client'
import { openSnackbar } from 'elements/snackbars'
import { getGraphqlUrl } from './api-base'
import { beginRequest } from './after-first-load'
import { httpStatusMessage } from './friendly-error'

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

let apolloClient = null

// 整個 App 共用一個 client。原本的 SSR 判斷（process.browser）在瀏覽器恆為 undefined，
// 每次呼叫都新建 client，啟動時會建出兩個 client 與兩份 cache。
export default function initApollo() {
  if (!apolloClient) {
    apolloClient = new ApolloClient({
      link: inflightLink.concat(authLink).concat(errorLink).concat(httpLink),
      cache: new InMemoryCache({ addTypename: false }),
    })
  }
  return apolloClient
}
