// 保護全店打卡記錄的「點打卡格開操作面板」：2026/02 改版時點擊被拿掉，編輯／刪除打卡與查看定位都無從使用（2026/10/21 恢復）。
// 規則：有編輯或刪除權限、或這筆打卡有定位，才能點開；面板內的編輯／刪除鈕各自依權限顯示。
// 也保護角色缺「打卡權限設定」區塊（舊角色）時頁面照常顯示、視為沒有權限（原本整頁變錯誤畫面）。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import AttendanceRecords from '..'

jest.setTimeout(20000)

const day = new Date()
day.setHours(0, 0, 0, 0)
const at = (h, m) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime()
const punch = (uuid, time, gps = false) => ({
  uuid,
  time,
  latitude: gps ? 25.03 : null,
  longitude: gps ? 121.56 : null,
  isLine: false,
  checkinType: gps ? 'CELLPHONE' : 'COMPUTER',
  distanceValue: 'LOWERTHAN25',
})

const clockInSection = ({ add = false, edit = false, del = false } = {}) => ({
  pageTitle: '打卡權限設定',
  authority: true,
  pageAuthority: [
    { pageName: '新增打卡紀錄', authority: add },
    { pageName: '編輯打卡紀錄', authority: edit },
    { pageName: '刪除打卡紀錄', authority: del },
  ],
})

const setup = ({ settings }) =>
  renderPage(<AttendanceRecords />, {
    route: '/attendance/records',
    fixtures: {
      FETCH_PROFILE_IDENDITY: { me: { id: 'user-1', merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
      GET_MERCHANT_AUTHORITIES: {
        getMerchantAuthorities: [{ id: 'auth-1', authorityName: '店長', authoritySettings: JSON.stringify(settings) }],
      },
      GET_ALL_ATTENDANCE: {
        attendanceRecords: [
          {
            userId: 'user-2',
            userName: '設計師小美',
            userNickName: null,
            totalClockInDays: 1,
            absenteeismDays: 0,
            totalLateMinutes: 0,
            attendanceRecord: [
              {
                date: day.getTime(),
                isLate: false,
                isLeaveEarly: false,
                clockInRecord: [{ in: punch('p-in', at(9, 0)), out: punch('p-out', at(18, 0), true), breakRecord: [] }],
              },
            ],
          },
        ],
      },
    },
  })

const cell = text => screen.getByText(text).closest('[role="button"]')

beforeEach(() => loginAs())
afterEach(cleanup)

it('有編輯／刪除權限：點打卡格開啟面板，面板內有編輯與刪除；鍵盤 Enter 也能開', async () => {
  setup({ settings: [clockInSection({ edit: true, del: true })] })
  await screen.findByText('設計師小美')
  fireEvent.click(cell('上09:00'))
  expect(await screen.findByText(/已選取打卡記錄:.*09:00 - 上班/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '編輯' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '刪除' })).toBeInTheDocument()
  cleanup()

  setup({ settings: [clockInSection({ edit: true })] })
  await screen.findByText('設計師小美')
  fireEvent.keyDown(cell('上09:00'), { key: 'Enter' })
  expect(await screen.findByText(/已選取打卡記錄:.*09:00 - 上班/)).toBeInTheDocument()
})

// 已修正（Jason 2026/10/22「加上」）：面板的「刪除」原本按下就直接送出刪除；改為先跳確認窗，確認後才送出、取消則不送
it('刪除打卡：先跳「確定要刪除這筆打卡紀錄嗎？」，取消不送出；確定才送出刪除', async () => {
  const { calls, settle } = setup({ settings: [clockInSection({ del: true })] })
  await screen.findByText('設計師小美')
  fireEvent.click(cell('上09:00'))
  await screen.findByText(/已選取打卡記錄:.*09:00 - 上班/)
  fireEvent.click(screen.getByRole('button', { name: '刪除' }))
  await settle()
  expect(callsOf(calls, 'deleteAttendantRecord')).toHaveLength(0)
  const confirm = await screen.findByRole('dialog', { name: '確定要刪除這筆打卡紀錄嗎？' })
  fireEvent.click(within(confirm).getByRole('button', { name: '取消' }))
  await wait(() => expect(screen.queryByRole('dialog', { name: '確定要刪除這筆打卡紀錄嗎？' })).toBeNull())
  expect(callsOf(calls, 'deleteAttendantRecord')).toHaveLength(0)
  // 取消後回到操作面板，可再按刪除並確定
  fireEvent.click(screen.getByRole('button', { name: '刪除' }))
  const again = await screen.findByRole('dialog', { name: '確定要刪除這筆打卡紀錄嗎？' })
  fireEvent.click(within(again).getByRole('button', { name: '確定' }))
  await wait(() => expect(callsOf(calls, 'deleteAttendantRecord')).toEqual([
    { operationName: 'deleteAttendantRecord', variables: { clockInScheduleUUId: 'p-in' } },
  ]))
})

it('沒有編輯／刪除權限：沒有定位的打卡格不能點；有定位的可點開看位置，但沒有編輯與刪除', async () => {
  setup({ settings: [clockInSection()] })
  await screen.findByText('設計師小美')
  expect(cell('上09:00')).toBeNull()
  fireEvent.click(cell('18:00'))
  expect(await screen.findByText('查看位置')).toBeInTheDocument()
  expect(screen.getByText('查看位置').closest('a')).toHaveAttribute('href', 'https://www.google.com/maps?q=25.03,121.56')
  expect(screen.queryByRole('button', { name: '編輯' })).toBeNull()
  expect(screen.queryByRole('button', { name: '刪除' })).toBeNull()
})

it('角色缺「打卡權限設定」區塊時頁面照常顯示，視為沒有權限', async () => {
  setup({ settings: [{ pageTitle: '客戶管理', authority: true, pageAuthority: [] }] })
  expect(await screen.findByText('設計師小美')).toBeInTheDocument()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  expect(cell('上09:00')).toBeNull()
  expect(screen.queryByRole('button', { name: /新增打卡/ })).toBeNull()
})
