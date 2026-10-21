import React, { useEffect } from 'react'
import { render, act, wait } from '@testing-library/react'
import { ApolloProvider, useQuery, gql, ApolloLink, Observable } from '@apollo/client'
import { createApolloClient } from '../init-apollo'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))

// 為什麼重要：全站約 536 個 effect 依 `loading` 的變化取資料、50 處呼叫 refetch。client 由 apollo-boost（v2）換成
// @apollo/client（v3）時，loading 的變化必須與原本完全相同，否則重新查詢後畫面停在舊資料（靜默失效）。
// 2026/10/21 實驗（docs/redesign/APOLLO_V3_EXPERIMENT.md）：v2 client 與 v3 client（不開 notifyOnNetworkStatusChange）
// 在各 fetchPolicy 下的序列完全相同——cache-and-network（全站 411 處）refetch 時 loading 會 true→false，其他 policy 不會。
// 開 notifyOnNetworkStatusChange 反而會讓 cache-first／network-only 多出 loading 變化，所以 init-apollo 不開。

const QUERY = gql`
  query Q {
    n
  }
`
let counter = 0
const link = new ApolloLink(() => new Observable(observer => {
  setTimeout(() => {
    observer.next({ data: { n: ++counter } })
    observer.complete()
  }, 10)
}))

function Probe({ log, refetchRef, policy }) {
  const q = useQuery(QUERY, policy ? { fetchPolicy: policy } : {})
  useEffect(() => {
    log.push(`loading=${q.loading} n=${q.data && q.data.n}`)
  }, [q.loading])
  refetchRef.current = q.refetch
  return null
}

async function loadingSequence(policy) {
  counter = 0
  const client = createApolloClient(link) // 與正式環境相同的 client 設定，只換掉連線
  const log = []
  const refetchRef = { current: null }
  render(<ApolloProvider client={client}><Probe log={log} refetchRef={refetchRef} policy={policy} /></ApolloProvider>)
  await wait(() => expect(log).toContain('loading=false n=1'))
  await act(async () => { await refetchRef.current() })
  await new Promise(resolve => setTimeout(resolve, 50))
  return log
}

test('cache-and-network（全站主要用法）：refetch 時 loading 會 true→false，依 loading 的 effect 才會重算', async () => {
  expect(await loadingSequence('cache-and-network')).toEqual(['loading=true n=undefined', 'loading=false n=1', 'loading=true n=1', 'loading=false n=2'])
})

test.each([undefined, 'cache-first', 'network-only', 'no-cache'])('%s：refetch 不改變 loading（與 v2 client 相同）', async policy => {
  expect(await loadingSequence(policy)).toEqual(['loading=true n=undefined', 'loading=false n=1'])
})
