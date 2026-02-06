import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { createUploadLink } from 'apollo-upload-client'
import { openSnackbar } from 'elements/snackbars'
import fetch from 'isomorphic-unfetch'

let apolloClient = null

if (!process.browser) {
  global.fetch = fetch
}
const error = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(error => {
      const { message, extensions } = error
      if (extensions.code && extensions.code === 'TKN_ERROR') {
        localStorage.clear()
        window.location.href = '/auth/login'
        return error
      } else if (extensions.code && extensions.code === 'TKN_IN_JAIL') {
        alert(message)
        return message
      }
      openSnackbar({ message, variant: 'error' })
      return error
    })
  }
  if (networkError) console.log(`[Network error]: ${networkError}`)
})
const authLink = setContext((_, { headers }) => {
  let usermerchantid = localStorage.getItem('userMerchant')
  const token = localStorage.getItem('token')
  if (usermerchantid) usermerchantid = JSON.parse(usermerchantid).id
  let result = {
    ...headers,
    accesstoken: token,
  }
  if (usermerchantid) {
    result = {
      headers: {
        ...result.headers,
        usermerchantid,
      },
    }
  }
  if (token) {
    result = {
      headers: {
        ...result.headers,
        accesstoken: token,
      },
    }
  }
  return result
})
// let url = 'https://apibeautyos.mlgroup.vip/graphql'
// let url = 'https://api.beautyos.co/graphql'
let url = process.env.REACT_APP_API_URL || 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app/graphql'

// 如果沒有設定環境變數，才執行自動網址判斷
if (!process.env.REACT_APP_API_URL) {
  if (window.location.href.indexOf('dev') !== -1) {
    url = 'https://crt-test-htlfg34mhq-de.a.run.app/graphql'
  } else if (window.location.href.indexOf('beautyos2') !== -1) {
    url = 'https://crt-test-htlfg34mhq-de.a.run.app/graphql'
  } else if (window.location.href.indexOf('localhost') !== -1) {
    url = 'https://crt-test-htlfg34mhq-de.a.run.app/graphql'
  }
}

// console.log('window',w)
// console.log('NODE_ENV2', beautyos2
const httpLink = createUploadLink({
  uri: url,
  headers: { 'Apollo-Require-Preflight': 'true' }
  // uri:
  //   NODE_ENV2 === 'production'
  //     ? 'https://apibeautyos.mlgroup.vip/graphql'
  //     // : 'https://apibeautyosdev.mlgroup.vip/graphql'
  // : 'http://localhost:4849/graphql'
  // // uri: 'http://localhost:4849/graphql'
})

function create(initialState) {
  return new ApolloClient({
    fetch,
    // connectToDevTools: process.browser,
    // ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    link: authLink.concat(error).concat(httpLink),
    cache: new InMemoryCache({
      addTypename: false,
    }).restore(initialState || {}),
  })
}

export default function initApollo(initialState) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}
