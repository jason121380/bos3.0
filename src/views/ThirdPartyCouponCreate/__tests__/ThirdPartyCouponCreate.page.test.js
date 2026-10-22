// 保護「新增第三方卡券」：名稱、手續費扣項方式（PERCENT 百分比／AMOUNT 固定金額）都填、手續費 ≥ 0 才能新增，百分比不得超過 100；
// 送出的名稱、手續費（數字）、扣項方式與「金額呈現為 0」；成功重抓列表、導回列表並提示。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption } from '../../__tests__/settingsPageKit.test'
import ThirdPartyCouponCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const setup = () =>
  renderPage(<ThirdPartyCouponCreate />, {
    fixtures: { CREATE_THIRD_PARTY_COUPON: { addThirdPartTicket: true }, GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: [] } },
    route: '/thirdPartyCoupon/create',
  })
const submit = () => screen.getByText('新增').closest('button')

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增第三方卡券', () => {
  it('名稱、扣項方式都填且手續費不為負才可新增', async () => {
    setup()
    expect(submit()).toBeDisabled()
    // 名稱欄位在 produce 的 updater 內才讀 event.target，以瀏覽器方式輸入
    typeLikeBrowser(screen.getByTestId('name'), '街口券')
    expect(submit()).toBeDisabled()
    pickOption(fieldByLabel('手續費扣項方式'), '百分比')
    expect(submit()).toBeEnabled()
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '-1' } })
    expect(submit()).toBeDisabled()
    // 清空手續費（NaN）也不能新增
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '' } })
    expect(submit()).toBeDisabled()
    // 「選擇手續費扣項方式」是停用的提示選項
    const placeholder = Array.from(fieldByLabel('手續費扣項方式').options).find(o => o.textContent === '選擇手續費扣項方式')
    expect(placeholder).toBeDisabled()
  })

  it('百分比：送出名稱、手續費數字、PERCENT 與金額呈現為 0，成功重抓並導回列表', async () => {
    const { calls } = setup()
    typeLikeBrowser(screen.getByTestId('name'), '街口券')
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '2.5' } })
    fireEvent.wheel(fieldByLabel('手續費'))
    pickOption(fieldByLabel('手續費扣項方式'), '百分比')
    fireEvent.click(screen.getByLabelText('金額呈現為0'))
    expect(screen.getByLabelText('金額呈現為0')).toBeChecked()
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/third-party-coupons'))
    expect(callsOf(calls, 'CREATE_THIRD_PARTY_COUPON')[0].variables).toEqual({
      input: { name: '街口券', type: 'PERCENT', handlingFee: 2.5, isNoCash: true },
    })
    expect(callsOf(calls, 'GET_THIRD_PARTY_COUPONS').length).toBeGreaterThanOrEqual(2)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '新增第三方卡券成功', variant: 'success' })
  })

  // 百分比手續費原本沒有上限檢查，150% 也能新增（帳單扣手續費會超過卡券金額）。
  // Jason 2026/10/22「照建議」：PERCENT 限制 0～100，超過時提示且不送出；100 整可以送出；固定金額不受此限。
  it('固定金額：送出 AMOUNT（超過 100 也可）；百分比超過 100 提示且不送出，100 可以送出', async () => {
    const { calls } = setup()
    typeLikeBrowser(screen.getByTestId('name'), '百貨禮券')
    pickOption(fieldByLabel('手續費扣項方式'), '固定金額')
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '30' } })
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_THIRD_PARTY_COUPON')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_THIRD_PARTY_COUPON')[0].variables.input).toEqual({
      name: '百貨禮券', type: 'AMOUNT', handlingFee: 30, isNoCash: false,
    })
    cleanup()
    const pct = setup()
    typeLikeBrowser(screen.getByTestId('name'), '高手續費券')
    pickOption(fieldByLabel('手續費扣項方式'), '百分比')
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '150' } })
    fireEvent.click(submit())
    expect(openSnackbar).toHaveBeenCalledWith({ message: '百分比手續費請輸入 0～100', variant: 'warning' })
    await pct.settle()
    expect(callsOf(pct.calls, 'CREATE_THIRD_PARTY_COUPON')).toHaveLength(0)
    expect(currentLocation()).toBe('/thirdPartyCoupon/create')
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '100' } })
    fireEvent.click(submit())
    await wait(() => expect(callsOf(pct.calls, 'CREATE_THIRD_PARTY_COUPON')).toHaveLength(1))
    expect(callsOf(pct.calls, 'CREATE_THIRD_PARTY_COUPON')[0].variables.input).toMatchObject({ type: 'PERCENT', handlingFee: 100 })
  })
})
