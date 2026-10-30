import React, { Suspense } from 'react'
import { act, render } from '@testing-library/react'
import useAfterFirstLoad, { __resetAfterFirstLoadForTest, beginRequest, useHoldFirstLoad } from '../after-first-load'

// 為什麼重要：版面把系統公告、訂單佇列、釘選頁、切換店家清單延到首屏完成後才查（避免與頁面渲染搶主執行緒）。
// 這些測試守住：①load 前、還有查詢在等回應時不放行（只看空閒會在頁面資料回來前就放行，等於沒延後）；
// ②之後一定會放行（Safari 無 requestIdleCallback、load 卡住都有保底），否則訂單佇列鈴鐺與切換店家清單永遠不出現；
// ③同一次開啟只等一次，換版面重新掛載不必再等；④頁面程式（lazy chunk）下載中也不放行——登入後是站內換頁，
// load 早已完成，若只看查詢，版面查詢一回來就會在頁面查詢開始前放行（Codex PR #237 指出，已重現）。

function Probe({ onValue }) {
  onValue(useAfterFirstLoad())
  return null
}

const renderProbe = () => {
  const values = []
  render(<Probe onValue={value => values.push(value)} />)
  return () => values[values.length - 1]
}

let readyState
let idleCallbacks
const runIdle = () => {
  const callbacks = idleCallbacks
  idleCallbacks = []
  callbacks.forEach(cb => cb())
}
beforeEach(() => {
  jest.useFakeTimers()
  __resetAfterFirstLoadForTest()
  readyState = 'loading'
  jest.spyOn(document, 'readyState', 'get').mockImplementation(() => readyState)
  idleCallbacks = []
  window.requestIdleCallback = jest.fn(cb => idleCallbacks.push(cb))
})
afterEach(() => {
  jest.useRealTimers()
  delete window.requestIdleCallback
})

const fireLoad = () => {
  readyState = 'complete'
  window.dispatchEvent(new Event('load'))
}

test('load 後、沒有查詢在等回應、瀏覽器空閒才放行', () => {
  const latest = renderProbe()
  act(() => runIdle())
  expect(latest()).toBe(false) // 還沒 load
  act(() => fireLoad())
  expect(window.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 3000 })
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('頁面查詢還在等回應時，空閒也不放行；全部回來後才放行', () => {
  const latest = renderProbe()
  const endPageQuery = beginRequest()
  act(() => fireLoad())
  act(() => runIdle())
  expect(latest()).toBe(false) // 等網路時主執行緒是閒的，不能因此放行
  act(() => endPageQuery())
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('空閒前又有新查詢發出（例如頁面依第一批結果再查）：繼續等到它回來', () => {
  const latest = renderProbe()
  act(() => fireLoad())
  const endFollowUp = beginRequest()
  act(() => runIdle())
  expect(latest()).toBe(false)
  act(() => {
    endFollowUp()
    endFollowUp() // 重複呼叫不會把計數扣成負數
  })
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('Safari（沒有 requestIdleCallback）：網路安靜後 0.5 秒放行', () => {
  delete window.requestIdleCallback
  const latest = renderProbe()
  act(() => fireLoad())
  act(() => jest.advanceTimersByTime(499))
  expect(latest()).toBe(false)
  act(() => jest.advanceTimersByTime(1))
  expect(latest()).toBe(true)
})

test('load 一直沒來或查詢一直沒回：10 秒後照樣放行，鈴鐺與店家清單不會永遠不出現', () => {
  const latest = renderProbe()
  beginRequest() // 永遠不結束
  act(() => jest.advanceTimersByTime(9999))
  expect(latest()).toBe(false)
  act(() => jest.advanceTimersByTime(1))
  expect(latest()).toBe(true)
})

test('頁面早已載入完成時（例如登入後才進版面），不等 load、直接等空閒', () => {
  readyState = 'complete'
  const latest = renderProbe()
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('同一次開啟只等一次：之後重新掛載的版面一開始就放行', () => {
  const first = renderProbe()
  act(() => fireLoad())
  act(() => runIdle())
  expect(first()).toBe(true)
  const values = []
  render(<Probe onValue={value => values.push(value)} />)
  expect(values[0]).toBe(true)
})

function Hold() {
  useHoldFirstLoad()
  return null
}

test('頁面載入佔位（Suspense fallback）存在期間不放行，卸載後才放行', () => {
  readyState = 'complete'
  const latest = renderProbe()
  const { unmount } = render(<Hold />)
  act(() => runIdle())
  expect(latest()).toBe(false)
  act(() => unmount())
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('登入後站內換頁：lazy 頁面還在下載時不放行，頁面掛載並發出查詢後，等查詢回來才放行', async () => {
  readyState = 'complete' // 站內換頁時 load 早已完成
  let resolveChunk
  let endPageQuery
  function Page() {
    React.useState(() => {
      endPageQuery = beginRequest()
    }) // 頁面掛載即發出查詢（同 useQuery）
    return null
  }
  const LazyPage = React.lazy(
    () =>
      new Promise(resolve => {
        resolveChunk = () => resolve({ default: Page })
      })
  )
  const latest = renderProbe()
  render(
    <Suspense fallback={<Hold />}>
      <LazyPage />
    </Suspense>
  )
  act(() => runIdle()) // 等頁面程式下載時主執行緒是閒的
  expect(latest()).toBe(false)
  await act(async () => {
    resolveChunk()
  })
  act(() => runIdle())
  expect(latest()).toBe(false) // 頁面查詢還在等回應
  act(() => endPageQuery())
  act(() => runIdle())
  expect(latest()).toBe(true)
})

test('已因空閒放行後，10 秒保底計時器到期不會再觸發任何更新', () => {
  const values = []
  render(<Probe onValue={value => values.push(value)} />)
  act(() => fireLoad())
  act(() => runIdle())
  expect(values[values.length - 1]).toBe(true)
  const rendersAfterReady = values.length
  act(() => jest.advanceTimersByTime(10000))
  expect(values).toHaveLength(rendersAfterReady)
})

test('版面有多個元件同時等待（鈴鐺、店家清單）：一起放行', () => {
  const first = renderProbe()
  const second = renderProbe()
  act(() => fireLoad())
  expect(window.requestIdleCallback).toHaveBeenCalledTimes(1)
  act(() => runIdle())
  expect([first(), second()]).toEqual([true, true])
})
