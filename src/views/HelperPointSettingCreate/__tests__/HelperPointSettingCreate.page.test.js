// 保護「新增互助點數設定」：名稱、點數使用成本（換算金額、是否依互助人固定金額）與點數獲得方式——固定金額送 retrieveFixed，
// 全段／分段送 retrieveSegmentSetting（可增刪段落、第一段不能刪）；數字欄位取絕對值的整數；成功導回業績抽成參數頁、
// 名稱必填；後端回 false 或錯誤時提示並可再按。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import HelperPointSettingCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const setup = (fixtures = {}) =>
  renderPage(<HelperPointSettingCreate />, {
    fixtures: { CREATE_MERCHANT_POINT_VALUE_SETTING: { createMerchantPointValueSetting: true }, ...fixtures },
    route: '/helper-point-setting/create',
  })
const confirm = () => screen.getByText('確認').closest('button')
const sent = calls => callsOf(calls, 'CREATE_MERCHANT_POINT_VALUE_SETTING')[0].variables.input
const type = (input, value) => {
  fireEvent.focusIn(input)
  fireEvent.wheel(input)
  fireEvent.change(input, { target: { value } })
}

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增互助點數設定', () => {
  it('固定金額：送出名稱、換算金額（取絕對值整數）、依互助人固定金額與 retrieveFixed，成功導回參數頁', async () => {
    const { calls } = setup()
    type(screen.getByLabelText('互助點數設定名稱'), '一般互助')
    fireEvent.click(screen.getByLabelText('依互助人固定金額'))
    const [paid, retrieve] = screen.getAllByLabelText('換算金額')
    type(paid, '-30.7')
    type(retrieve, '12')
    expect(paid).toHaveValue(30)
    fireEvent.click(confirm())
    await wait(() => expect(currentLocation()).toBe('/performanceDeductionParameter'))
    expect(sent(calls)).toEqual({ name: '一般互助', paidFixed: 30, retrievePointWay: 'FIXED', isAccordingToHelper: true, retrieveFixed: 12 })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '新增成功' })
  })

  it('分段：可新增、編輯、刪除段落（第一段不能刪），送出 retrieveSegmentSetting、不送 retrieveFixed', async () => {
    const { calls } = setup()
    type(screen.getByLabelText('互助點數設定名稱'), '分段互助')
    fireEvent.click(screen.getByText('分段'))
    expect(screen.queryByLabelText('刪除此段')).toBeNull()
    type(screen.getByLabelText('點數門檻'), '100')
    type(document.getElementById('helperPointPrice-0'), '10')
    fireEvent.click(screen.getByLabelText('新增一段'))
    type(document.getElementById('helperPointThreshold-1'), '200')
    type(document.getElementById('helperPointPrice-1'), '-25')
    fireEvent.click(screen.getByLabelText('新增一段'))
    // 只有最後一段有「新增一段」；第二段以後才有「刪除此段」
    expect(screen.getAllByLabelText('新增一段')).toHaveLength(1)
    expect(screen.getAllByLabelText('刪除此段')).toHaveLength(2)
    fireEvent.click(screen.getAllByLabelText('刪除此段')[1])
    fireEvent.click(confirm())
    await wait(() => expect(callsOf(calls, 'CREATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(1))
    expect(sent(calls)).toEqual({
      name: '分段互助',
      paidFixed: 0,
      retrievePointWay: 'SEGMENTED',
      isAccordingToHelper: false,
      retrieveSegmentSetting: [
        { threshold: 100, price: 10 },
        { threshold: 200, price: 25 },
      ],
    })
  })

  it('全段與分段各自保留段落；再按已選的方式不會取消選取', async () => {
    const { calls } = setup()
    type(screen.getByLabelText('互助點數設定名稱'), '全段互助')
    fireEvent.click(screen.getByText('分段'))
    type(document.getElementById('helperPointThreshold-0'), '999')
    fireEvent.click(screen.getByText('全段'))
    fireEvent.click(screen.getByText('全段'))
    expect(screen.getByText('全段')).toHaveAttribute('aria-pressed', 'true')
    expect(document.getElementById('helperPointThreshold-0')).toHaveValue(0)
    type(document.getElementById('helperPointThreshold-0'), '50')
    fireEvent.click(confirm())
    await wait(() => expect(callsOf(calls, 'CREATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(1))
    expect(sent(calls)).toEqual(
      expect.objectContaining({ retrievePointWay: 'NONSEGMENTED', retrieveSegmentSetting: [{ threshold: 50, price: 0 }] })
    )
  })

  // 名稱原本沒有必填檢查，空白也會送出。Jason 2026/10/22「照建議」：名稱去掉前後空白後為空時提示且不送出，按鈕維持可按。
  it('名稱空白（含只有空白）時提示且不送出', async () => {
    const utils = setup()
    fireEvent.click(confirm())
    expect(openSnackbar).toHaveBeenLastCalledWith({ variant: 'warning', message: '請輸入互助點數設定名稱' })
    type(screen.getByLabelText('互助點數設定名稱'), '   ')
    fireEvent.click(confirm())
    expect(openSnackbar).toHaveBeenCalledTimes(2)
    await utils.settle()
    expect(callsOf(utils.calls, 'CREATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(0)
    expect(confirm()).toBeEnabled()
    expect(currentLocation()).toBe('/helper-point-setting/create')
  })

  it('後端回 false 提示新增失敗；錯誤時提示錯誤；都可再按', async () => {
    const first = setup({ CREATE_MERCHANT_POINT_VALUE_SETTING: { createMerchantPointValueSetting: false } })
    type(screen.getByLabelText('互助點數設定名稱'), '一般互助')
    fireEvent.click(confirm())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '新增失敗' }))
    expect(sent(first.calls).name).toBe('一般互助')
    expect(confirm()).toBeEnabled()
    cleanup()
    setup({ CREATE_MERCHANT_POINT_VALUE_SETTING: new Error('名稱重複') })
    type(screen.getByLabelText('互助點數設定名稱'), '一般互助')
    fireEvent.click(confirm())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '名稱重複' }))
    await wait(() => expect(confirm()).toBeEnabled())
  })
})
