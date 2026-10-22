// 顧客詳細頁測試共用的假資料與渲染（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證假資料本身）。
// 為什麼需要：顧客詳細一次發出十多支查詢（顧客、消費紀錄、統計明細、會員卡／紅利設定、髮況、簡訊、抽獎券…），
// 各分頁測試都需要一組「每支查詢都有內容」的回應，並以正式路由 /management/customers/:id/:tab 渲染（頁面用 match.params 與 history）。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { Route } from 'react-router-dom'
import { renderPage } from '../../../__tests__/testkit.test'
import CustomerManagementDetails from '..'

const isMain = expect.getState().testPath === __filename

export const CUSTOMER = {
  id: 'c1',
  no: 'C01',
  name: '陳小姐',
  gender: 'FEMALE',
  email: 'chen@example.com',
  lineId: 'chen01',
  nickName: '小陳',
  birthday: { year: '79', month: '2', day: '28' },
  category: '一般',
  cellphone: '0912345678',
  address: '台北市信義區',
  remark: '怕冷',
  preferDesigner: { id: 'd2', name: 'Amy' },
  latestDesigner: { id: 'd1', name: '王小美' },
  source: '朋友介紹',
  membershipPurchaseRecord: [],
  isUnwelcome: false,
  isLineBinded: false,
  createdAt: new Date(2025, 0, 2, 23, 30).getTime(),
}

export const ORDER = {
  id: 'o1',
  date: new Date(2026, 9, 21, 23, 40).getTime(),
  orderNo: 'A001',
  isDesignate: true,
  customerName: '陳小姐',
  customerCellphone: '0912345678',
  customerNo: 'C01',
  designerName: '王小美',
  designerNo: '01',
  otherPayName: 'LINE Pay',
  service: 800.4,
  product: 300,
  membership: 0,
  usedTicket: 200,
  ticketSellIntoPerformance: 1000.6,
  ticketSellNotIntoPerformance: 0,
  otherPayWayForDecount: 100,
  walletUsedForDecount: 50,
  bonusDecountForReport: 0,
  businessCash: 2150,
  remark: '剪短',
  TPTName: { service: ['團購券', '禮券'], product: ['禮券'], membership: [], overAll: [] },
  raffleCount: 0,
}

export const baseFixtures = (overrides = {}) => ({
  FETCH_CUSTOMER_DETAIL: { customer: CUSTOMER },
  GET_CUSTOMER_ORDER_LIST: { getCustomerOrders: { orderList: [ORDER], totalCount: 120, pageLimit: 50, pageOffset: 0 } },
  GET_ORDER_STATIC_DETAIL: {
    getOrderStaticDetail: [
      {
        orderId: 'o1',
        orderStaticDetail: [
          { designerName: '王小美', serviceType: '服務', itemName: '精緻剪髮', count: 1, price: 800, helperList: [{ helperName: '李助理', helperNo: '02', helperType: '洗髮' }] },
          { designerName: '王小美', serviceType: '卡券使用', itemName: '護髮卡', count: 1, price: 199.99, helperList: [] },
        ],
      },
    ],
  },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  GET_CUSTOMER_HAIR_INFO: {
    getCustomerHairInfo: {
      hairProperties: ['細軟', '受損'],
      scalpProperties: [],
      permAppliance: ['冷燙'],
      permPotion: [],
      hairColorCategory: [],
      hairColor: ['霧棕'],
      hairDyeFormula: '6/0 + 7/1\n雙氧 6%',
    },
  },
  GET_CUSTOMER_SMS_RECORD: { customerSMSRecord: [] },
  GET_CUSTOMER_EVENT_TICKETS_FOR_MERCHANT: { customerEventTicketsForMerchant: [] },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: false },
  GET_CUSTOMER_BONUS: { getIsCustomerBonusActive: false },
  GET_CUSTOMER_BONUS_RECORD: { customerBonusRecord: [] },
  ...overrides,
})

// 以正式路由渲染；route 例：/management/customers/c1/general。onHistory 可取得路由的 history（模擬從其他頁進來）
export const renderDetails = ({ route = '/management/customers/c1/general', fixtures = {}, onHistory, ...options } = {}) =>
  renderPage(
    <>
      <Route path="/management/customers/:id/:tab?" render={props => <CustomerManagementDetails {...props} />} />
      {onHistory && <Route render={({ history }) => { onHistory(history); return null }} />}
    </>,
    {
      fixtures: baseFixtures(fixtures),
      route,
      ...options,
    }
  )

if (isMain) {
  describe('顧客詳細測試假資料', () => {
    it('預設回應：顧客、消費紀錄、統計明細都有內容，覆寫只換指定查詢', () => {
      const fixtures = baseFixtures({ GET_CUSTOMER_SMS_RECORD: { customerSMSRecord: [{ message: 'x' }] } })
      expect(fixtures.FETCH_CUSTOMER_DETAIL.customer.id).toBe('c1')
      expect(fixtures.GET_CUSTOMER_ORDER_LIST.getCustomerOrders.orderList[0].id).toBe(
        fixtures.GET_ORDER_STATIC_DETAIL.getOrderStaticDetail[0].orderId
      )
      expect(fixtures.GET_CUSTOMER_SMS_RECORD.customerSMSRecord).toHaveLength(1)
    })
  })
}
