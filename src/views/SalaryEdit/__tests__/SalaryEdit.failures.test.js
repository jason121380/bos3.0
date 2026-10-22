// 保護「薪資維護」查詢失敗時的行為（覆蓋率第三波 V9）：
// - 月結紀錄查詢失敗或後端回 null：不整頁錯誤，概覽各欄顯示 0；店家啟用會員卡時照樣顯示會員卡欄（0）
// - 員工已存加扣項查詢失敗：不帶入、不顯示加扣項編輯區，「儲存」「儲存並上一筆／下一筆」停用（避免以空白資料蓋掉已存的薪資項目）；
//   出勤、月結名單、員工名單查詢失敗也不整頁錯誤
// - 已存紀錄的加扣項清單為 null 時當成沒有已存項目
// GraphQL 全由模擬 link 回應，不連後端、不改真實薪資。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import SalaryEdit from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const SEPT = new Date(2026, 8, 1).getTime()
const FIXTURES = {
  GET_MERCHANT_SALARY_INCREASE_ITEMS: { getMerchantSalaryIncreaseItems: [{ id: 'i1', itemSetting: '工資', type: 'INCREASE', sorting: 1 }] },
  GET_MERCHANT_SALARY_DECREASE_ITEMS: { getMerchantSalaryDecreaseItems: [{ id: 'd1', itemSetting: '勞健保費', type: 'DECREASE', sorting: 1 }] },
  GET_USER_SALARY_ITEM: { userSalaryItemRecord: { userId: 'u2', increaseItem: [{ itemName: '工資', price: 30000, type: 'INCREASE' }], decreaseItem: [] } },
  GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: false },
  FETCH_USER_SALARY: { user: { id: 'u2', name: '小美', designerNo: 'A02', remarkForSalary: '', salary: { id: 's1' } } },
  FETCH_USER_IS_SALARYCHECKED: { user: { isSalaryItemLocked: false } },
  GET_ALL_USERS_SALARY_ITEMS: { users: { users: [{ id: 'u1', name: '阿明', isSalaryChecked: true }, { id: 'u2', name: '小美', isSalaryChecked: true }, { id: 'u3', name: '老王', isSalaryChecked: true }] } },
  GET_USERS_IS_MONTH_CHECKOUT: { users: { users: [{ id: 'u1', isSalaryChecked: true }, { id: 'u2', isSalaryChecked: true }, { id: 'u3', isSalaryChecked: true }] } },
  FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2: new Error('查詢失敗'),
  GET_ATTENDANCE_STATISTICS: { getParameterCheckoutAndSalaryItemsSetting: { isAttendanceStatisticsDisplayOnUserSalary: true } },
  GET_ATTENDANCE_STATUS: { attendanceRecords: [] },
  SET_USER_SALARY_ITEM: { setUserSalaryItem: true },
}
const setup = (extra = {}) =>
  renderPage(<SalaryEdit match={{ params: { id: 'u2' } }} location={{ search: `?date=${SEPT}` }} />, {
    route: `/salary/edit/u2?date=${SEPT}`,
    fixtures: { ...FIXTURES, ...extra },
  })
const overviewValue = label => screen.getByText(label).parentElement.querySelector('.text-heading').textContent

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資維護：查詢失敗', () => {
  it('月結紀錄查詢失敗：不整頁錯誤，概覽各欄顯示 0，加扣項照常可編輯', async () => {
    const { settle } = setup()
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    await wait(() => expect(overviewValue('總實業績')).toBe('0'))
    expect(screen.getByText('互助使用總金額').parentElement.querySelector('.text-heading').textContent).toBe('0(0)')
    expect(screen.getByText('互助獲得總金額').parentElement.querySelector('.text-heading').textContent).toBe('0(0)')
    expect(screen.queryByText('會員卡實業績')).toBeNull()
    expect(screen.getByLabelText('工資')).toHaveValue('30000')
    expect(screen.getByText('儲存').closest('button')).not.toBeDisabled()
  })

  it('月結紀錄回 null 且店家啟用會員卡：會員卡欄顯示 0', async () => {
    const { settle } = setup({
      GET_IS_MEMBERSHIP_CARD_ACTIVE: { getIsMemberShipCardActive: true },
      FETCH_USER_SALARY_MONTHLY_CHECKOUT_RECORD_V2: { getUserSalaryMonthlyCheckoutRecordV2: { salaryMonthlyCheckoutRecord: null, isHelperRetrireveAutoSet: true } },
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    await wait(() => expect(screen.getByText('會員卡實業績')).toBeInTheDocument())
    expect(Array.from(screen.getByText('會員卡實業績').parentElement.querySelectorAll('.text-heading')).map(n => n.textContent)).toEqual(['0', '0'])
    expect(Array.from(screen.getByText('會員卡抽成').parentElement.querySelectorAll('.text-heading')).map(n => n.textContent)).toEqual(['0', '0'])
  })

  it('員工已存加扣項、出勤、月結名單、員工名單查詢失敗：不整頁錯誤、不顯示編輯區、不能存檔', async () => {
    const { calls, settle } = setup({
      GET_USER_SALARY_ITEM: new Error('查詢失敗'),
      GET_ATTENDANCE_STATUS: new Error('查詢失敗'),
      GET_USERS_IS_MONTH_CHECKOUT: new Error('查詢失敗'),
      GET_ALL_USERS_SALARY_ITEMS: new Error('查詢失敗'),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByLabelText('工資')).toBeNull()
    expect(screen.getByText('儲存').closest('button')).toBeDisabled()
    expect(screen.queryByText(/總打卡天數/)).toBeNull()
    expect(callsOf(calls, 'SET_USER_SALARY_ITEM')).toHaveLength(0)
  })

  it('加扣項尚未帶入時「儲存並上一筆／下一筆」也停用', async () => {
    const { settle } = setup({ GET_USER_SALARY_ITEM: new Error('查詢失敗') })
    await settle()
    expect(screen.getByText('儲存並上一筆').closest('button')).toBeDisabled()
    expect(screen.getByText('儲存並下一筆').closest('button')).toBeDisabled()
  })

  it('已存紀錄的加扣項清單為 null 時當成沒有已存項目', async () => {
    const { settle } = setup({ GET_USER_SALARY_ITEM: { userSalaryItemRecord: { userId: 'u2', increaseItem: null, decreaseItem: null } } })
    await settle()
    await wait(() => expect(screen.getByLabelText('工資')).toHaveValue('0'))
    expect(screen.getByLabelText('勞健保費')).toHaveValue('0')
  })
})
