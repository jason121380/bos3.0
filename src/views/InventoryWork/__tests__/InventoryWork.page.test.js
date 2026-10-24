// 保護「盤點作業」列表：進頁以本月（台灣時間）查詢盤點單；有未完成草稿時提示、主要按鈕改「繼續盤點」並連到草稿；
// 依盤點人員篩選送出人員 id（清除送 null）、換月份重查；已完成的單連到檢視、未完成的連到編輯；日期時間以台灣時間；
// 查詢失敗不白屏。GraphQL 全由 testkit 模擬，不連後端。
import 'lib/install-business-timezone'
import React from 'react'
import CustomizedSnackbars, { openSnackbar } from 'elements/snackbars'
jest.mock('elements/snackbars', () => {
  const actual = jest.requireActual('elements/snackbars')
  return { __esModule: true, ...actual, openSnackbar: jest.fn(actual.openSnackbar) }
})
beforeEach(() => openSnackbar.mockImplementation(jest.requireActual('elements/snackbars').openSnackbar))
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { USERS, clearCombo, inputsByLabel, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import InventoryWork from '..'

jest.setTimeout(30000)

const DATE = Date.UTC(2026, 9, 20, 16, 30) // 台灣 2026/10/21 00:30
const CHECKED = [
  { id: 'inv-1', date: DATE, isDraft: false, creatorName: '王小美' },
  { id: 'inv-2', date: DATE, isDraft: true, creatorName: '李助理' },
]

const renderList = overrides =>
  renderPage(<><CustomizedSnackbars /><InventoryWork /></>, {
    fixtures: {
      GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
      GET_INVENTORYS: { getInventorys: { draft: null, checked: CHECKED } },
      ...overrides,
    },
    route: '/inventory-work',
  })

const lastInput = calls => {
  const list = callsOf(calls, 'GET_INVENTORYS')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('盤點作業列表', () => {
  it('以本月查詢；沒有草稿時主要按鈕為「開始盤點」；列表狀態、連結、台灣時間', async () => {
    const { settle, calls } = renderList()
    await settle()
    const now = new Date()
    expect(lastInput(calls)).toEqual({
      dateRange: { startDate: startOfMonth(now).getTime(), endDate: endOfMonth(now).getTime() },
      creatorId: null,
    })
    expect(screen.getByRole('link', { name: '開始盤點' })).toHaveAttribute('href', '/inventory-work/create')
    expect(screen.getByText('共 2 筆資料')).toBeInTheDocument()
    const done = screen.getByText('王小美').closest('tr')
    expect(within(done).getByText('2026/10/21 00:30')).toBeInTheDocument()
    expect(within(done).getByText('已完成')).toBeInTheDocument()
    expect(within(done).getByRole('link', { name: '查看盤點單' })).toHaveAttribute('href', '/inventory-work/review/inv-1')
    const draft = screen.getByText('李助理').closest('tr')
    expect(within(draft).getByText('未完成')).toBeInTheDocument()
    expect(within(draft).getByRole('link', { name: '繼續盤點' })).toHaveAttribute('href', '/inventory-work/edit/inv-2')
  })

  it('有未完成草稿：提示完成盤點（3 秒後自動關閉），主要按鈕改為繼續盤點該草稿', async () => {
    // 只接管三秒提示計時；查詢與 testkit 的穩定檢查仍使用真正的非同步排程。
    const nativeSetTimeout = window.setTimeout
    const notifications = []
    window.setTimeout = (callback, delay, ...args) => {
      if (delay === 3000) {
        notifications.push(() => callback(...args))
        return nativeSetTimeout(() => {}, 0)
      }
      return nativeSetTimeout(callback, delay, ...args)
    }
    try {
      const { settle } = renderList({
        GET_INVENTORYS: { getInventorys: { draft: { id: 'draft-9', date: DATE, isDraft: true, creatorName: '店長' }, checked: [] } },
      })
      await settle()
      expect(screen.getByText('尚有未完成的盤點草稿，請按右上角按鈕完成盤點。')).toBeInTheDocument()
      expect(openSnackbar).toHaveBeenCalledTimes(1)
      expect(openSnackbar).toHaveBeenCalledWith({ message: '尚有未完成的盤點草稿，請按右上角按鈕完成盤點。', variant: 'warning' })
      fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
      expect(openSnackbar).toHaveBeenCalledTimes(1)
      fireEvent.click(screen.getByRole('button', { name: /查詢/ }))
      await settle()
      expect(openSnackbar).toHaveBeenCalledTimes(1)
      expect(screen.getAllByRole('link', { name: '繼續盤點' })[0]).toHaveAttribute('href', '/inventory-work/edit/draft-9')
      expect(screen.getByText('目前沒有盤點紀錄')).toBeInTheDocument()
      expect(notifications.length).toBeGreaterThan(0)
      act(() => notifications.forEach(expire => expire()))
      await wait(() => expect(screen.queryByText('尚有未完成的盤點草稿，請按右上角按鈕完成盤點。')).toBeNull(), { timeout: 8000 })
    } finally {
      cleanup()
      window.setTimeout = nativeSetTimeout
    }
  })

  it('依盤點人員篩選送出人員 id；清除送 null；換成上個月重查', async () => {
    const { settle, calls } = renderList()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    pickOption('盤點人員', 'A01 王小美', { typed: 'A01' })
    expect(inputsByLabel('盤點人員')[0]).toHaveValue('A01 王小美')
    fireEvent.click(screen.getByRole('button', { name: /查詢/ }))
    await settle()
    expect(lastInput(calls).creatorId).toBe('user-a')
    pickOption('盤點人員', ' 李助理')
    expect(inputsByLabel('盤點人員')[0]).toHaveValue('李助理')
    clearCombo(inputsByLabel('盤點人員')[0])
    fireEvent.click(screen.getByRole('button', { name: /查詢/ }))
    await settle()
    expect(lastInput(calls).creatorId).toBeNull()
    pickQuickDate('上個月')
    fireEvent.click(screen.getByRole('button', { name: /查詢/ }))
    await settle()
    const last = subMonths(new Date(), 1)
    expect(lastInput(calls).dateRange).toEqual({ startDate: startOfMonth(last).getTime(), endDate: endOfMonth(last).getTime() })
  })

  it('查詢失敗：顯示錯誤與重新查詢，不是一直載入、也不進錯誤畫面', async () => {
    const { settle, calls } = renderPage(<><CustomizedSnackbars /><InventoryWork /></>, {
      fixtures: {
        GET_USERS_FOR_CREATE_PICKING: { users: { users: USERS } },
        GET_INVENTORYS: new Error('盤點查詢失敗'),
      },
      route: '/inventory-work',
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    expect(screen.getByText('無法載入盤點資料')).toBeInTheDocument()
    expect(screen.queryByText('目前沒有盤點紀錄')).toBeNull()
    const before = callsOf(calls, 'GET_INVENTORYS').length
    fireEvent.click(screen.getByRole('button', { name: '重新查詢' }))
    await settle()
    expect(callsOf(calls, 'GET_INVENTORYS').length).toBeGreaterThan(before)
    expect(screen.getByText('無法載入盤點資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
  })

  it('盤點人員查詢失敗：篩選區顯示錯誤與重查，列表仍可依盤點單結果顯示', async () => {
    const { settle } = renderPage(<><CustomizedSnackbars /><InventoryWork /></>, {
      fixtures: {
        GET_USERS_FOR_CREATE_PICKING: new Error('人員查詢失敗'),
        GET_INVENTORYS: { getInventorys: { draft: null, checked: CHECKED } },
      },
      route: '/inventory-work',
    })
    await settle()
    expect(screen.getByText('共 2 筆資料')).toBeInTheDocument()
    expect(screen.queryByLabelText('載入中')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /篩選/ }))
    expect(screen.getByText('無法載入盤點人員')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重新查詢盤點人員' }))
    await settle()
    expect(screen.getByText('無法載入盤點人員')).toBeInTheDocument()
  })
})
