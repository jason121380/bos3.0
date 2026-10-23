// 保護「第三方卡券設定」列表：手續費依扣項方式顯示（百分比顯示 %、固定金額千分位）、金額呈現為 0 的標示、編輯連結；
// 勾選後批次刪除逐筆送出 id、成功重抓並提示、失敗提示錯誤；查詢失敗時顯示 0 筆不整頁壞。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import ThirdPartyCoupons from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const COUPONS = [
  { id: 't1', name: '街口券', type: 'PERCENT', handlingFee: 2.5, isNoCash: false },
  { id: 't2', name: '百貨禮券', type: 'AMOUNT', handlingFee: 1500, isNoCash: true },
]
const setup = (fixtures = {}) =>
  renderPage(<ThirdPartyCoupons />, {
    fixtures: { GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: COUPONS }, ...fixtures },
    route: '/third-party-coupons',
  })
const row = name => within(screen.getByText(name).closest('tr'))
const toolbar = () => within(screen.getByRole('toolbar', { hidden: true }))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('第三方卡券設定', () => {
  it('百分比手續費顯示 %、固定金額顯示千分位；標示金額是否呈現為 0；編輯連到該卡券', async () => {
    setup()
    expect(await screen.findByText('共 2 筆')).toBeInTheDocument()
    expect(row('街口券').getByText('2.5%')).toBeInTheDocument()
    expect(row('街口券').getByText('否')).toBeInTheDocument()
    expect(row('百貨禮券').getByText('1,500')).toBeInTheDocument()
    expect(row('百貨禮券').getByText('是')).toBeInTheDocument()
    expect(row('百貨禮券').getByLabelText('編輯第三方卡券')).toHaveAttribute('href', '/thirdPartyCoupon/edit/t2')
  })

  it('全選後可取消；單選可勾可取消；沒有卡券時全選不可用', async () => {
    setup()
    await screen.findByText('共 2 筆')
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 街口券')).toBeChecked()
    expect(screen.getByLabelText('選取 百貨禮券')).toBeChecked()
    fireEvent.click(all)
    expect(screen.getByLabelText('選取 街口券')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 街口券'))
    expect(all.indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('選取 街口券'))
    expect(screen.getByLabelText('選取 街口券')).not.toBeChecked()
    cleanup()
    setup({ GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: [] } })
    await screen.findByText('共 0 筆')
    expect(screen.getByLabelText('全選')).toBeDisabled()
  })

  it('批次刪除：每張勾選的卡券各送一次刪除，成功後重抓列表並提示', async () => {
    const { calls } = setup({ DELETE_THIRD_PARTY_COUPON: { deleteThirdPartTicket: true } })
    await screen.findByText('共 2 筆')
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(toolbar().getByText('刪除'))
    await wait(() => expect(callsOf(calls, 'DELETE_THIRD_PARTY_COUPON')).toHaveLength(2))
    expect(callsOf(calls, 'DELETE_THIRD_PARTY_COUPON').map(c => c.variables)).toEqual([{ id: 't1' }, { id: 't2' }])
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '刪除第三方卡券成功', variant: 'success' }))
    await wait(() => expect(callsOf(calls, 'GET_THIRD_PARTY_COUPONS').length).toBeGreaterThanOrEqual(2))
  })

  it('沒勾選時刪除不送出；刪除失敗時提示錯誤', async () => {
    const { calls } = setup({ DELETE_THIRD_PARTY_COUPON: new Error('已有帳單使用') })
    await screen.findByText('共 2 筆')
    // 批次列在沒勾選時隱藏（仍在 DOM），直接觸發也不送出
    fireEvent.click(toolbar().getByText('刪除'))
    expect(callsOf(calls, 'DELETE_THIRD_PARTY_COUPON')).toHaveLength(0)
    fireEvent.click(screen.getByLabelText('選取 街口券'))
    fireEvent.click(toolbar().getByText('刪除'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '已有帳單使用', variant: 'error' }))
  })

  it('查詢失敗時顯示 0 筆，不整頁壞', async () => {
    renderPage(<ThirdPartyCoupons />, { fallback: 'error', route: '/third-party-coupons' })
    expect(await screen.findByText('共 0 筆')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
