// 保護打帳單「鎖定日期」的每日自動解除：每天 23:59（helper/dailyUnlock 算出的時間）到時，若有鎖定就解除鎖定、
// 帳單日期改回現在，避免隔天還用前一天的日期打單；沒鎖定時不更動。到時後再排下一次（只排一個計時器）。
// 這裡把「距離解除還有多久」換成很短的時間，才不用真的等到 23:59；其餘照真實頁面運作，GraphQL 由模擬 link 回應。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import format from 'date-fns/format'
import { msUntilDailyUnlock } from 'helper/dailyUnlock'
import { loginAs } from '../../../__tests__/testkit.test'
import { setupPage, waitPageReady } from './orderCreateKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('helper/dailyUnlock', () => ({ msUntilDailyUnlock: jest.fn() }))

beforeEach(() => {
  loginAs()
  // 第一次（開頁時）50ms 後到時；之後的下一次排得很遠（測試結束時隨頁面卸載取消）
  msUntilDailyUnlock.mockImplementation((_now, initial) => (initial ? 50 : 24 * 60 * 60 * 1000))
})
afterEach(cleanup)

const dateInput = () => screen.getByLabelText(/^選擇日期/)
const lockFixtures = { GET_IS_LOCK_DATE_DISPLAY: { getIsDateLockDisplay: true } }

it('鎖定中到了解除時間：解除鎖定、清掉記住的日期，帳單日期改回現在，並排下一次', async () => {
  const lockedDay = new Date(2026, 0, 5, 10, 0)
  localStorage.setItem('lockDate', true)
  localStorage.setItem('lockDateTimeStamp', lockedDay.getTime())
  setupPage(lockFixtures)
  await waitPageReady()
  await wait(() => expect(localStorage.getItem('lockDate')).toBeNull())
  expect(localStorage.getItem('lockDateTimeStamp')).toBeNull()
  await wait(() => expect(dateInput().value).toContain(format(new Date(), 'yyyy/MM/dd')))
  // 畫面上的「鎖定日期」勾選應跟著取消：目前仍顯示勾選（checked 讀 localStorage 得到 null，React 視為非受控而不更新），已回報，這裡不斷言
  expect(msUntilDailyUnlock).toHaveBeenLastCalledWith(expect.any(Date), false)
})

it('沒有鎖定時到了解除時間：帳單日期不變，仍排下一次', async () => {
  // 解除時間排在選完日期之後（1.5 秒）；選日期前後都先確認解除還沒發生，順序才成立——
  // 否則在慢的機器上，解除可能在選日期之前就跑完，即使解除錯把日期改回今天，測試也會通過（Codex review PR #264）
  msUntilDailyUnlock.mockImplementation((_now, initial) => (initial ? 1500 : 24 * 60 * 60 * 1000))
  const unlocked = () => msUntilDailyUnlock.mock.calls.some(([, initial]) => initial === false)
  setupPage(lockFixtures)
  await waitPageReady()
  expect(unlocked()).toBe(false)
  // 先選一個日期（未鎖定）
  fireEvent.click(dateInput())
  const today = new Date()
  const day15 = new Date(today.getFullYear(), today.getMonth(), 15)
  fireEvent.click(await screen.findByLabelText(format(day15, 'yyyy年M月d日')))
  fireEvent.click(screen.getByText('確認'))
  await wait(() => expect(dateInput().value).toContain(format(day15, 'yyyy/MM/dd')))
  // 選完日期時解除仍未發生；若這裡失敗代表機器太慢、順序不成立，而不是行為錯誤
  expect(unlocked()).toBe(false)
  await wait(() => expect(unlocked()).toBe(true), { timeout: 5000 })
  expect(dateInput().value).toContain(format(day15, 'yyyy/MM/dd'))
  expect(localStorage.getItem('lockDate')).toBeNull()
})
