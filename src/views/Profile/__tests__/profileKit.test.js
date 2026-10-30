// 「個人頁」（Profile）測試共用的假資料與渲染（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證假資料本身）。
// 為什麼需要：個人頁依登入者角色的「個人檔案」區塊決定可見分頁（以角色 id 比對），各分頁再各自查詢登入者自己的資料；
// 測試需要一份「全部開放」的角色、登入者 profile，以及回應頁面外框查詢（釘選、報到、預約歷史）的 fixtures。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { renderPage, USER_ID } from '../../../__tests__/testkit.test'
import Profile from '..'

const isMain = expect.getState().testPath === __filename

export const PROFILE_TABS = ['基本資料', '帳單紀錄', '預約表', '設計師日報表', '互助日報表', '抽成報表', '薪資條', '密碼設定', '打卡紀錄']

export const profileSection = (overrides = {}) => ({
  pageTitle: '個人檔案',
  authority: true,
  pageAuthority: PROFILE_TABS.map(pageName => ({ pageName, authority: overrides[pageName] === undefined ? true : overrides[pageName] })),
})

export const ME = {
  id: USER_ID,
  name: '王小美',
  firstName: '小美',
  lastName: '王',
  nickName: 'Amy',
  email: 'amy@example.com',
  cellphone: '0911222333',
  contactAddress: '台北市',
  address: '新北市',
  serialNumber: 'A123456789',
  birthday: new Date(1995, 4, 20).getTime(),
  gender: 'FEMALE',
  designerNo: '07',
  status: 'ok',
  avatar: null,
  selfIntroduction: '擅長染髮',
  selfIntroductionLink: 'https://example.com/amy',
  merchantIdentity: { authorityName: '設計師', authorityId: 'auth-1' },
}

export const PINNED_DEF = [
  { pageTitle: '櫃檯作業', pageAuthority: [{ pageName: '打帳單' }, { pageName: '帳單列表' }, { pageName: '掛單列表' }] },
  { pageTitle: '預約管理', pageAuthority: [{ pageName: '預約紀錄' }] },
  { pageTitle: '空的分類', pageAuthority: [] },
]

export const baseFixtures = ({
  section = profileSection(),
  me = ME,
  pinned = { usingStoreIds: ['merchant-1', 'merchant-2'], pinnedSettings: JSON.stringify([{ name: '帳單列表' }]) },
} = {}) => ({
  PROFILE: { me },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      { id: 'auth-0', authorityName: '設計師', authoritySettings: '[]' },
      { id: 'auth-1', authorityName: '設計師', authoritySettings: JSON.stringify([section]) },
    ],
  },
  GET_USER_PINNED_TABLE_SETTING: { getUserPinnedTableSettings: pinned },
  GET_PINNED_TABLE_DEF_STRUCTURES: { getPinnedTableDefStructures: JSON.stringify(PINNED_DEF) },
  GET_CHECKIN_SETTING_FOR_CALENDAR: { getMerchantCheckinSettings: { isBookingCheckinEnabled: false, isUnDoneBookingManualNotify: false } },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: false },
  GET_BOOKING_HISTORY_DISPLAY: { getParameterAboutBookingSetting: { isBookingHistoryDisplay: false } },
  getMerchantDesignerCalendar: { getMerchantDesignerWeekCalendar: { merchantDesignerCalendar: [], merchantUnappointCalendar: [] } },
  GET_USER_GROUPS_WOCS: {
    getUserGroupWOCS: JSON.stringify({
      allMerchants: [
        { id: 'merchant-1', name: '測試店' },
        { id: 'merchant-2', name: '二店' },
      ],
      groups: [],
      merchants: [],
    }),
  },
})

export function renderProfile(tab, { fixtures = {}, delays, ...options } = {}) {
  const history = { push: jest.fn() }
  const utils = renderPage(<Profile match={{ params: { tab } }} history={history} />, {
    route: `/profile/${tab}`,
    fixtures: { ...baseFixtures(options), ...fixtures },
    delays,
  })
  return { ...utils, history }
}

if (isMain) {
  it('假資料：角色「個人檔案」區塊列出全部分頁', () => {
    expect(profileSection({ 薪資條: false }).pageAuthority.find(p => p.pageName === '薪資條').authority).toBe(false)
    expect(PROFILE_TABS).toHaveLength(9)
  })
}
