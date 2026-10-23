// 「員工資料」頁（EmployeeManagementDetail）測試共用的假資料與渲染（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證假資料本身）。
// 為什麼需要：這頁依登入者角色的「編輯員工」區塊決定可見分頁，每個分頁又各自查詢；測試需要一份「所有分頁都開放」的角色、
// 一位資料齊全的員工（含抽成設定），以及回應頁面外框查詢的 fixtures。GraphQL 全由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { renderPage, USER_ID } from '../../../__tests__/testkit.test'
import EmployeeManagementDetail from '..'

const isMain = expect.getState().testPath === __filename

export const EMP_ID = 'emp-1'

export const TAB_LABELS = ['基本資料', '帳單紀錄', '抽成設定', '抽成報表', '預約表', '薪資條', '薪資加扣項', '密碼與安全', '打卡紀錄']

// 角色「編輯員工」區塊：預設全部開放（含「人員設定」），可覆寫個別頁面
export const editEmployeeSection = (overrides = {}) => ({
  pageTitle: '編輯員工',
  authority: true,
  pageAuthority: [...TAB_LABELS, '人員設定'].map(pageName => ({
    pageName,
    authority: overrides[pageName] === undefined ? true : overrides[pageName],
  })),
})

export const DESIGNER = {
  id: EMP_ID,
  name: '王小美',
  firstName: '小美',
  lastName: '王',
  nickName: 'Amy',
  cellphone: '0911222333',
  email: 'amy@example.com',
  status: 'ok',
  gender: 'FEMALE',
  avatar: null,
  birthday: new Date(1995, 4, 20).getTime(),
  employmentStartDate: new Date(2024, 0, 2).getTime(),
  contactAddress: '台北市',
  address: '新北市',
  serialNumber: 'S001',
  designerNo: '07',
  jobTitle: '設計師',
  remark: '週一休',
  identity: 'DESIGNER',
  lineAccountId: null,
  isLineBinded: true,
  deductionWay: '依服務',
  isBookingAutoAccept: 'BYSTORE',
  isRTCO: false,
  merchantIdentity: { authorityName: '設計師', authorityId: 'auth-designer' },
  isDisplayOnBookingList: true,
  isDisplayOnServiceList: true,
  isDisplayOnPerformanceList: false,
  isDisplayOnSalaryReportList: true,
  isDisplayOnClockInReportList: false,
  isDisplayOnBookingRecord: true,
  insuranceGrade: 0,
  insuranceDeductible: 0,
  bankCode: '822',
  bankName: '中國信託',
  bankBranchName: '台北分行',
  bankAccount: '123456789012',
  familyMemberName: '王媽媽',
  familyMemberRelation: '母女',
  familyMemberPhone: '0922000111',
  familyMemberAddress: '新北市',
  userRake: {
    userId: EMP_ID,
    isSegmented: false,
    nonSegmented: [
      {
        attribute: '',
        rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 0, rake: 30 }] },
      },
    ],
    segmented: [],
  },
  merchants: [{ id: 'merchant-1', name: '測試店' }],
  userCategory: { id: 'job-1' },
  bookingLimit: 2,
  isCellphoneLogin: true,
  selfIntroduction: null,
  selfIntroductionLink: null,
}

export const baseFixtures = ({ section = editEmployeeSection(), designer = DESIGNER, loginAuthorityName = '店長' } = {}) => ({
  PROFILE: { me: { id: USER_ID, name: '店長小林', merchantIdentity: { authorityName: loginAuthorityName, authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: v => ({
    getMerchantAuthorities: [
      { id: 'auth-1', authorityName: loginAuthorityName, authoritySettings: JSON.stringify([section]) },
      { id: 'auth-designer', authorityName: '設計師', authoritySettings: '[]' },
    ],
  }),
  DESIGNER: { merchantDesigner: designer },
  GET_CHECKIN_SETTING_FOR_CALENDAR: { getMerchantCheckinSettings: { isBookingCheckinEnabled: false, isUnDoneBookingManualNotify: false } },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: false },
  GET_BOOKING_HISTORY_DISPLAY: { getParameterAboutBookingSetting: { isBookingHistoryDisplay: false } },
  // 預約表分頁的週曆（欄位名稱不像清單，testkit 不會自動補成陣列）
  getMerchantDesignerCalendar: { getMerchantDesignerWeekCalendar: { merchantDesignerCalendar: [], merchantUnappointCalendar: [] } },
})

// 渲染某個分頁；history.push 記錄在回傳的 history.push（分頁切換、儲存後回列表）
export function renderDetail(tab, { fixtures = {}, id = EMP_ID, delays, fallback, ...options } = {}) {
  const history = { push: jest.fn() }
  const utils = renderPage(<EmployeeManagementDetail match={{ params: { tab, id } }} history={history} />, {
    route: `/management/employee/${id}/${tab}`,
    fixtures: { ...baseFixtures(options), ...fixtures },
    delays,
    fallback,
  })
  return { ...utils, history }
}

if (isMain) {
  it('假資料：角色「編輯員工」區塊列出全部分頁與人員設定', () => {
    const section = editEmployeeSection({ 薪資條: false })
    expect(section.pageAuthority.map(p => p.pageName)).toEqual([...TAB_LABELS, '人員設定'])
    expect(section.pageAuthority.find(p => p.pageName === '薪資條').authority).toBe(false)
    expect(DESIGNER.userRake.nonSegmented[0].attribute).toBe('')
  })
}
