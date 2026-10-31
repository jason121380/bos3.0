// 打帳單的教學模式提示。目前全站 TeachingModeState 固定關閉教學模式，但各區塊仍依 context 決定是否顯示提示；
// 為什麼重要：教學模式重新開啟時，這些提示（哪裡輸入扣入金、助理要先設定、預收卡不入業績但先收費）是新進櫃台的操作說明，
// 文案與出現位置要正確；關閉時不能出現（避免干擾熟手）。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import TeachingContext from 'context/teachingModeContext'
import OrderCreate from '../OrderCreate'
import { pageFixtures, setupPage, waitPageReady } from './orderCreateKit.test'

afterEach(cleanup)
beforeEach(() => loginAs())

const HINTS = [
  '服務項目必須設定好助理才能輸入助理**',
  '這邊賣的卡將『不入業績』，但會先跟客人『收費』**',
  '使用卡券必須設定好助理才能輸入助理**',
  '扣入金 第三方支付在這邊輸入**',
]

describe('打帳單：教學模式', () => {
  it('開啟時各區塊顯示操作提示', async () => {
    renderPage(
      <TeachingContext.Provider value={{ teachingMode: true, setTeachingMode: () => {} }}>
        <OrderCreate />
      </TeachingContext.Provider>,
      { fixtures: pageFixtures(), route: '/order/create' }
    )
    await waitPageReady()
    HINTS.forEach(hint => expect(screen.getAllByText(hint).length).toBeGreaterThan(0))
  })

  it('關閉時（目前預設）不顯示任何提示', async () => {
    setupPage()
    await waitPageReady()
    HINTS.forEach(hint => expect(screen.queryByText(hint)).toBeNull())
  })
})
