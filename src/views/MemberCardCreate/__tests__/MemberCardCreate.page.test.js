// 保護「新增會員卡」：代號／名稱／類別必填才能新增；送出的有效天數、成本、員工自購價、鎖價（打帳單能否改價）、
// 顏色、圖片、會籍說明與所屬店家；開啟「可販售」才送售價與抽成；有效天數不得為負；成功導回會員卡列表、失敗提示錯誤。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, MERCHANT_ID } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption } from '../../__tests__/settingsPageKit.test'
import MemberCardCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const CATEGORIES = [
  { uuid: 'cat-1', no: 'A01', name: '儲值卡' },
  { uuid: 'cat-2', no: 'A02', name: '年卡' },
]
const setup = (fixtures = {}) =>
  renderPage(<MemberCardCreate />, {
    fixtures: {
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: CATEGORIES },
      createMembership: { createMembership: true },
      ...fixtures,
    },
    route: '/member-card/create',
  })
const submit = () => screen.getByTestId('submit')
const sentInput = calls => callsOf(calls, 'createMembership')[0].variables.input
const fillRequired = async () => {
  await wait(() => expect(fieldByLabel('會員卡類別').options.length).toBeGreaterThan(1))
  fireEvent.change(screen.getByTestId('no'), { target: { value: 'M01' } })
  fireEvent.change(screen.getByTestId('name'), { target: { value: '萬元儲值卡' } })
  pickOption(fieldByLabel('會員卡類別'), 'A02 / 年卡')
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增會員卡', () => {
  it('代號、名稱、類別都填才可新增；查詢會員卡清單與分類（含已刪除）', async () => {
    const { calls } = setup()
    await wait(() => expect(fieldByLabel('會員卡類別').options.length).toBe(3))
    expect(submit()).toBeDisabled()
    fireEvent.change(screen.getByTestId('no'), { target: { value: 'M01' } })
    fireEvent.change(screen.getByTestId('name'), { target: { value: '萬元儲值卡' } })
    expect(submit()).toBeDisabled()
    pickOption(fieldByLabel('會員卡類別'), 'A01 / 儲值卡')
    expect(submit()).toBeEnabled()
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS_CATEGORY')[0].variables).toEqual({ input: { paranoid: true } })
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS')[0].variables).toEqual({
      input: { categoryUUIds: [], keyword: '', pageLimit: 50, pageOffset: 0 },
    })
  })

  it('不販售：送出有效天數、成本、員工價、鎖價、顏色、圖片、說明與登入店家，抽成為固定 0；成功導回列表並重抓清單', async () => {
    const { calls } = setup()
    await fillRequired()
    fireEvent.change(fieldByLabel('有效天數'), { target: { value: '365' } })
    fireEvent.change(fieldByLabel('成本價格'), { target: { value: '1200.5' } })
    fireEvent.change(fieldByLabel('員工自購價格'), { target: { value: '800' } })
    fireEvent.change(fieldByLabel('會員卡的顏色'), { target: { value: '#000000' } })
    fireEvent.change(fieldByLabel('會員卡文字的顏色'), { target: { value: '#FFD700' } })
    fireEvent.change(fieldByLabel('圖片'), { target: { value: 'https://img.example/card.png' } })
    fireEvent.change(fieldByLabel('會籍說明'), { target: { value: '一年內有效' } })
    pickOption(fieldByLabel('打帳單是否能更改預設價格'), '不可更改')
    // 數字欄位滾輪不改值（移開焦點）
    document.querySelectorAll('input[type="number"]').forEach(input => fireEvent.wheel(input))
    expect(screen.queryByText('抽成')).toBeNull()
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/member-card-record'))
    expect(sentInput(calls)).toEqual({
      cost: 1200.5,
      sellPrice: 0,
      employeePrice: 800,
      no: 'M01',
      name: '萬元儲值卡',
      MembershipCategoryUUID: 'cat-2',
      commissionWay: 'fixed',
      commission: 0,
      isAvailableForSale: false,
      isLocked: 'TRUE',
      effecitveDay: 365,
      color: '#000000',
      textColor: '#FFD700',
      image: 'https://img.example/card.png',
      comment: '一年內有效',
      OfficialBrandMerchantId: MERCHANT_ID,
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功會員卡', variant: 'success' })
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS').length).toBeGreaterThanOrEqual(2)
  })

  it('可販售：出現售價與抽成設定，送出售價、抽成方式與抽成；百分比抽成的標籤加上 %', async () => {
    const { calls } = setup()
    await fillRequired()
    fireEvent.click(screen.getByRole('switch'))
    fireEvent.change(fieldByLabel('會員卡價格'), { target: { value: '10000' } })
    expect(fieldByLabel('抽成數字')).toBeTruthy()
    pickOption(fieldByLabel('抽成方式'), '依售價-成本(%)')
    expect(screen.getByText('抽成數字%')).toBeInTheDocument()
    pickOption(fieldByLabel('抽成方式'), '售價(%)')
    fireEvent.change(fieldByLabel('抽成數字%'), { target: { value: '5' } })
    document.querySelectorAll('input[type="number"]').forEach(input => fireEvent.wheel(input))
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'createMembership')).toHaveLength(1))
    expect(sentInput(calls)).toEqual(
      expect.objectContaining({
        isAvailableForSale: true,
        sellPrice: 10000,
        commissionWay: 'byPrice',
        commission: 5,
        isLocked: 'UNSET',
        effecitveDay: 0,
      })
    )
  })

  it('有效天數為負數時提示錯誤、不送出', async () => {
    const { calls } = setup()
    await fillRequired()
    fireEvent.change(fieldByLabel('有效天數'), { target: { value: '-1' } })
    fireEvent.click(submit())
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(callsOf(calls, 'createMembership')).toHaveLength(0)
  })

  it('送出失敗時提示錯誤、留在本頁', async () => {
    setup({ createMembership: new Error('代號重複') })
    await fillRequired()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '代號重複', variant: 'error' }))
    expect(currentLocation()).toBe('/member-card/create')
  })

  it('色票：點顏色鈕開啟色票，選色後填入並關閉（卡片底色與文字色各自獨立）', async () => {
    const { calls } = setup()
    await fillRequired()
    fireEvent.click(screen.getByLabelText('選擇會員卡的顏色'))
    fireEvent.click(document.querySelector('[title="#f44336"]'))
    expect(fieldByLabel('會員卡的顏色')).toHaveValue('#f44336')
    expect(document.querySelector('[title="#f44336"]')).toBeNull()
    fireEvent.click(screen.getByLabelText('選擇會員卡文字的顏色'))
    fireEvent.click(document.querySelector('[title="#2196f3"]'))
    expect(fieldByLabel('會員卡文字的顏色')).toHaveValue('#2196f3')
    expect(fieldByLabel('會員卡的顏色')).toHaveValue('#f44336')
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'createMembership')).toHaveLength(1))
    expect(sentInput(calls)).toEqual(expect.objectContaining({ color: '#f44336', textColor: '#2196f3' }))
  })

  it('沒有登入店家時所屬店家送 null', async () => {
    loginAs({ merchant: null })
    const { calls } = setup()
    await fillRequired()
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'createMembership')).toHaveLength(1))
    expect(sentInput(calls).OfficialBrandMerchantId).toBeNull()
  })

  it('分類查詢失敗時下拉為空、不能新增，不整頁壞', async () => {
    renderPage(<MemberCardCreate />, { fallback: 'error', route: '/member-card/create' })
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(fieldByLabel('會員卡類別').options).toHaveLength(1)
    expect(submit()).toBeDisabled()
  })
})
