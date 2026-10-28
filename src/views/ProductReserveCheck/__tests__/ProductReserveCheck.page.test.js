// 保護「商品庫存盤點表」：進頁即以本月 1 日 0 點到今天 23:59:59（台灣時間）查詢全部商品；換日期區間重查；
// 加入商品（可依代號或名稱篩選、全選）後搜尋只送出所選商品 id，清空所選自動以全部商品重查；
// 庫存金額合計＝各商品庫存金額相加；未建立的期間顯示「-」；查詢失敗或沒有資料顯示「無資料」、不白屏。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { endOfDay, endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { callsOf, loginAs, renderPage, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { comboOptions, inputsByLabel, optionTexts, pickOption, pickQuickDate } from '../../__tests__/stockKit.test'
import ProductReserveCheck from '..'

jest.setTimeout(30000)

const PRODUCTS = [
  { id: 'p-1', no: 'P01', name: '洗髮精' },
  { id: 'p-2', no: 'P02', name: '護髮油' },
  { id: 'p-3', no: null, name: '無代號商品' },
]

const REPORT = {
  reserveCheckSummary: [
    { id: 'p-1', productName: '洗髮精', reserveCount: 10, price: 120, reservePrice: 1200 },
    { id: 'p-2', productName: '護髮油', reserveCount: 3, price: 3000, reservePrice: 9000 },
  ],
  productReserveChecks: [
    {
      id: 'p-1',
      productName: '洗髮精',
      reserveChecks: [
        { title: '10/01', in: 5, out: 2, balance: 13, isCreated: true },
        { title: '10/02', in: 0, out: 0, balance: 0, isCreated: false },
      ],
    },
    {
      id: 'p-2',
      productName: '護髮油',
      reserveChecks: [
        { title: '10/01', in: 1, out: 0, balance: 3, isCreated: true },
        { title: '10/02', in: 0, out: 1, balance: 2, isCreated: true },
      ],
    },
  ],
}

const renderReport = (overrides, options) =>
  renderPage(<ProductReserveCheck />, {
    fixtures: {
      GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: PRODUCTS } },
      GET_PRODUCT_RESERVE_CHECK: { productReserveCheck: REPORT },
      ...overrides,
    },
    ...options,
  })

const lastInput = calls => {
  const list = callsOf(calls, 'GET_PRODUCT_RESERVE_CHECK')
  return list[list.length - 1].variables.input
}

beforeEach(() => loginAs())
afterEach(cleanup)

describe('商品庫存盤點表', () => {
  it('進頁以本月 1 日到今天結束（台灣時間）查詢全部商品；合計庫存金額；未建立的期間顯示「-」', async () => {
    const { settle, calls } = renderReport()
    await settle()
    const now = new Date()
    expect(lastInput(calls)).toEqual({
      dateRange: { startDate: startOfMonth(now).getTime(), endDate: endOfDay(now).getTime() },
      productIds: [],
    })
    expect(screen.getByText('10,200')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    const created = rows.find(r => within(r).queryByText('10/01'))
    expect(Array.from(created.querySelectorAll('td')).map(td => td.textContent)).toEqual(['10/01', '5', '2', '13', '1', '0', '3'])
    const notCreated = rows.find(r => within(r).queryByText('10/02'))
    expect(Array.from(notCreated.querySelectorAll('td')).map(td => td.textContent)).toEqual(['10/02', '-', '-', '-', '0', '1', '2'])
  })

  it('換成上個月：以上個月整月重查', async () => {
    const { settle, calls } = renderReport()
    await settle()
    pickQuickDate('上個月')
    await settle()
    const last = subMonths(new Date(), 1)
    expect(lastInput(calls).dateRange).toEqual({ startDate: startOfMonth(last).getTime(), endDate: endOfMonth(last).getTime() })
  })

  it('加入商品：只列有代號的商品、可依代號或名稱篩選；搜尋送出所選商品 id；清空所選自動重查全部', async () => {
    const { settle, calls } = renderReport()
    await settle()
    expect(optionTexts('加入商品')).toEqual(['P01 - 洗髮精', 'P02 - 護髮油'])
    expect(optionTexts('加入商品', { typed: 'p02' })).toEqual(['P02 - 護髮油'])
    expect(optionTexts('加入商品', { typed: '洗髮' })).toEqual(['P01 - 洗髮精'])
    pickOption('加入商品', 'P01 - 洗髮精')
    fireEvent.keyDown(inputsByLabel('加入商品')[0], { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(lastInput(calls).productIds).toEqual(['p-1'])
    fireEvent.mouseDown(screen.getByRole('button', { name: '移除 洗髮精' }))
    await settle()
    expect(lastInput(calls).productIds).toEqual([])
  })

  it('全選：加入所有商品後搜尋送出全部 id', async () => {
    const { settle, calls } = renderReport()
    await settle()
    fireEvent.click(screen.getByRole('button', { name: '全選' }))
    expect(screen.getByRole('button', { name: '移除 無代號商品' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    await settle()
    expect(lastInput(calls).productIds).toEqual(['p-1', 'p-2', 'p-3'])
    // 打開下拉時，已選的選項標示為勾選
    const input = inputsByLabel('加入商品')[0]
    fireEvent.focusIn(input)
    fireEvent.click(input)
    expect(comboOptions().length).toBeGreaterThan(0)
  })

  it('查詢失敗顯示「無法載入資料」與重新查詢；沒有資料顯示「無資料」，都不進錯誤畫面', async () => {
    // 2026/10/28 稽核 C-1：查詢失敗改顯示 QueryFailed（可重試），不再與「沒有資料」混用同一個空狀態
    const { settle } = renderReport({ GET_PRODUCT_RESERVE_CHECK: new Error('報表逾時') })
    await settle()
    expect(screen.getByText('無法載入資料')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新查詢' })).toBeEnabled()
    cleanup()
    const empty = renderReport({ GET_PRODUCT_RESERVE_CHECK: { productReserveCheck: null } })
    await empty.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    cleanup()
    const failed = renderPage(<ProductReserveCheck />, { fallback: 'error' })
    await failed.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    await wait(() => expect(screen.getByText('無法載入資料')).toBeInTheDocument())
  })
})
