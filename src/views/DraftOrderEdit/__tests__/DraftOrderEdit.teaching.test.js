// 掛單詳細的教學模式提示（店販、會員卡列的「勾選將入業績但不收費用」）。全站目前固定關閉教學模式，
// 但各列仍依 context 決定是否顯示；為什麼重要：重新開啟教學模式時，這是第三方卡券欄位的唯一說明，關閉時不能干擾畫面。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import TeachingContext from 'context/teachingModeContext'
import DraftOrderEdit from '../index'
import { clearCheckedOutDrafts } from '../draftCheckoutGuard'
import { DESIGNER, PRODUCT, YEAR_CARD, draftFixtures, makeOrder, pageReady, setupDraft } from './draftPageKit.test'

afterEach(cleanup)
beforeEach(() => {
  loginAs()
  clearCheckedOutDrafts()
})

const HINT = '勾選將入業績但不收費用**'
// 一列店販、一列會員卡（提示畫在每一列裡）
const order = makeOrder({
  productOrders: [
    {
      id: 'po-1',
      name: PRODUCT.name,
      count: 1,
      price: PRODUCT.sellPrice,
      thirdPartyPayId: null,
      seller: { id: DESIGNER.userId, lastName: '王', firstName: '小美', designerNo: '01' },
      product: { id: PRODUCT.id, no: PRODUCT.no, name: PRODUCT.name, isLocked: PRODUCT.isLocked },
    },
  ],
  membershipOrders: [
    {
      purchaseDate: new Date(2026, 9, 21).getTime(),
      validDayCount: 365,
      expiryDate: new Date(2027, 9, 21).getTime(),
      price: 12000,
      thirdPartyPayId: null,
      remark: '',
      seller: { id: DESIGNER.userId },
      membership: { uuid: YEAR_CARD.uuid, isLocked: 'FALSE', effecitveDay: 365 },
    },
  ],
})

describe('掛單詳細：教學模式', () => {
  it('開啟時店販與會員卡列顯示第三方卡券的說明', async () => {
    const page = renderPage(
      <TeachingContext.Provider value={{ teachingMode: true, setTeachingMode: () => {} }}>
        <DraftOrderEdit match={{ params: { id: 'order-1' } }} />
      </TeachingContext.Provider>,
      { fixtures: draftFixtures({ order }), route: '/draft-order/order-1' }
    )
    await pageReady(page)
    expect(screen.getAllByText(HINT).length).toBeGreaterThanOrEqual(2)
  })

  it('關閉時（目前預設）不顯示', async () => {
    const page = setupDraft({ order })
    await pageReady(page)
    expect(screen.queryByText(HINT)).toBeNull()
  })
})
