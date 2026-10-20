// 取得全站共用的 Apollo client（單例，見 init-apollo.js）。
// 原本這裡是 Next.js 的 SSR 包裝（getInitialProps／getDataFromTree），本專案是純前端 SPA 從未使用；
// 且 `initApollo(initApollo().cache.extract())` 每次呼叫都會建出兩個 client，已改為回傳單例。
import initApollo from './init-apollo'

export const client = () => initApollo()
