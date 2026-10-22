// 保護「編輯第三方卡券」：從卡券清單找出網址 id 的那張並帶入名稱、手續費、扣項方式（PERCENT／AMOUNT）與金額呈現為 0；
// 儲存送出 id 與修改後的內容、成功重抓並導回列表；必填與手續費不得為負的檢查。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption, selectedText } from '../../__tests__/settingsPageKit.test'
import ThirdPartyCouponEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const COUPONS = [
  { id: 't1', name: '街口券', type: 'PERCENT', handlingFee: 2.5, isNoCash: false },
  { id: 't2', name: '百貨禮券', type: 'AMOUNT', handlingFee: 30, isNoCash: true },
]
const setup = (id = 't2', fixtures = {}) =>
  renderPage(<ThirdPartyCouponEdit match={{ params: { id } }} />, {
    fixtures: {
      GET_THIRD_PARTY_COUPONS: { getThirdPartTicket: COUPONS },
      UPDATE_UPDATE_THIRD_PARTY_COUPON: { updateThirdPartTicket: true },
      ...fixtures,
    },
    route: `/thirdPartyCoupon/edit/${id}`,
  })
const save = () => screen.getByText('儲存').closest('button')

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('編輯第三方卡券', () => {
  it('帶入網址 id 那張卡券的資料', async () => {
    setup('t2')
    await wait(() => expect(screen.getByTestId('name')).toHaveValue('百貨禮券'))
    expect(fieldByLabel('手續費')).toHaveValue(30)
    expect(selectedText(fieldByLabel('手續費扣項方式'))).toBe('固定金額')
    expect(screen.getByLabelText('金額呈現為0')).toBeChecked()
  })

  it('改成百分比、取消金額呈現為 0 後儲存：送出 id 與新內容，成功重抓並導回列表', async () => {
    const { calls } = setup('t2')
    await wait(() => expect(screen.getByTestId('name')).toHaveValue('百貨禮券'))
    typeLikeBrowser(screen.getByTestId('name'), '百貨禮券（新）')
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '3.5' } })
    fireEvent.wheel(fieldByLabel('手續費'))
    pickOption(fieldByLabel('手續費扣項方式'), '百分比')
    fireEvent.click(screen.getByLabelText('金額呈現為0'))
    fireEvent.click(save())
    await wait(() => expect(currentLocation()).toBe('/third-party-coupons'))
    expect(callsOf(calls, 'UPDATE_UPDATE_THIRD_PARTY_COUPON')[0].variables).toEqual({
      id: 't2',
      input: { name: '百貨禮券（新）', type: 'PERCENT', handlingFee: 3.5, isNoCash: false },
    })
    expect(callsOf(calls, 'GET_THIRD_PARTY_COUPONS').length).toBeGreaterThanOrEqual(2)
    expect(openSnackbar).toHaveBeenCalledWith({ message: '更新第三方卡券成功', variant: 'success' })
  })

  it('名稱清空或手續費為負時不能儲存', async () => {
    setup('t1')
    await wait(() => expect(screen.getByTestId('name')).toHaveValue('街口券'))
    expect(save()).toBeEnabled()
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '-1' } })
    expect(save()).toBeDisabled()
    fireEvent.change(fieldByLabel('手續費'), { target: { value: '0' } })
    expect(save()).toBeEnabled()
    typeLikeBrowser(screen.getByTestId('name'), '')
    expect(save()).toBeDisabled()
  })
})
