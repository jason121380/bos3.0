// 推播套件（socket.io-client，動態載入的 chunk）載入失敗時：只記錄錯誤，頂列與鈴鐺照常顯示，不讓整個版面拋錯。
// 為什麼重要：部署換版後舊頁面抓不到舊 chunk 是常見情況；推播只是即時更新，不能因此讓所有頁面進不去。
import React from 'react'
import { act, cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import TopBar from '../TopBar'

jest.mock('socket.io-client', () => {
  throw new Error('Failed to fetch dynamically imported module')
})
jest.mock('lib/after-first-load', () => ({ __esModule: true, default: () => true, useHoldFirstLoad: () => {} }))

beforeEach(() => {
  loginAs()
  jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  act(() => {
    cleanup()
  })
})

it('推播套件載入失敗：記錄錯誤，鈴鐺照常顯示', async () => {
  const { settle } = renderPage(<TopBar userMerchants={{ loading: false, data: null }} onOpenNavBarMobile={() => {}} />, {
    fixtures: {
      PROFILE: { me: { id: 'user-1', name: '店長', theme: 'DEFAULT', merchantIdentity: { authorityName: '高階主管', authorityId: 'auth-1' } } },
      GET_USING_ORDER_QUEUE: { getUsingOrderQueue: [] },
    },
    route: '/order/create',
  })
  await settle()
  await wait(() => expect(console.error).toHaveBeenCalledWith('socket.io-client 載入失敗', expect.any(Error)))
  expect(screen.getByRole('button', { name: /^訂單佇列/ })).toBeInTheDocument()
})
