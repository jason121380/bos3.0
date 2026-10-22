// 保護「編輯互助點數設定」：依網址 id 帶入名稱、換算金額、依互助人固定金額與點數獲得方式（固定金額或全段／分段的段落）；
// 儲存送出 updateSettingId 與內容（固定金額送 retrieveFixed、段落送 retrieveSegmentSetting）；成功導回業績抽成參數頁、
// 名稱必填；後端回 false 或錯誤時提示並可再按。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import HelperPointSettingEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const setting = overrides => ({
  id: 'hp1',
  name: '分段互助',
  paidFixed: 30,
  retrievePointWay: 'SEGMENTED',
  retrieveFixed: 0,
  retrieveSegmentSetting: [
    { threshold: 100, price: 10 },
    { threshold: 200, price: 25 },
  ],
  isAccordingToHelper: true,
  ...overrides,
})
const setup = ({ data = setting(), ...fixtures } = {}) =>
  renderPage(<HelperPointSettingEdit match={{ params: { id: 'hp1' } }} />, {
    fixtures: {
      GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT: { getMerchantPointValueSetting: data },
      UPDATE_MERCHANT_POINT_VALUE_SETTING: { updateMerchantPointValueSetting: true },
      ...fixtures,
    },
    route: '/helper-point-setting/edit/hp1',
  })
const save = () => screen.getByText('儲存').closest('button')
const sent = calls => callsOf(calls, 'UPDATE_MERCHANT_POINT_VALUE_SETTING')[0].variables.input
const type = (input, value) => {
  fireEvent.focusIn(input)
  fireEvent.wheel(input)
  fireEvent.change(input, { target: { value } })
}
const loaded = () => wait(() => expect(screen.getByLabelText('互助點數設定名稱')).toHaveValue('分段互助'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('編輯互助點數設定', () => {
  it('帶入分段設定：段落、換算金額與依互助人固定金額；以網址 id 查詢', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'GET_MERCHANT_POINT_VALUE_SETTING_FOR_EDIT')[0].variables).toEqual({ input: 'hp1' })
    expect(screen.getByText('分段')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByLabelText('點數門檻').map(i => i.value)).toEqual(['100', '200'])
    expect(screen.getByLabelText('依互助人固定金額')).toBeChecked()
    expect(screen.getAllByLabelText('換算金額')[0]).toHaveValue(30)
  })

  it('修改段落後儲存：送出 updateSettingId 與段落，成功導回參數頁', async () => {
    const { calls } = setup()
    await loaded()
    type(screen.getByLabelText('互助點數設定名稱'), '分段互助 v2')
    fireEvent.click(screen.getByLabelText('依互助人固定金額'))
    type(screen.getAllByLabelText('換算金額')[0], '-40')
    type(screen.getAllByLabelText('點數門檻')[1], '300')
    type(screen.getAllByLabelText('換算金額')[2], '35')
    fireEvent.click(screen.getByLabelText('新增一段'))
    type(screen.getAllByLabelText('點數門檻')[2], '500')
    fireEvent.click(screen.getAllByLabelText('刪除此段')[0])
    fireEvent.click(save())
    await wait(() => expect(currentLocation()).toBe('/performanceDeductionParameter'))
    expect(sent(calls)).toEqual({
      updateSettingId: 'hp1',
      updateSettingData: {
        name: '分段互助 v2',
        paidFixed: 40,
        retrievePointWay: 'SEGMENTED',
        isAccordingToHelper: false,
        retrieveSegmentSetting: [
          { threshold: 100, price: 10 },
          { threshold: 500, price: 0 },
        ],
      },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '儲存成功' })
  })

  it('固定金額的設定：帶入並送出 retrieveFixed；改成全段時送預設段落', async () => {
    const { calls } = setup({ data: setting({ retrievePointWay: 'FIXED', retrieveFixed: 8, retrieveSegmentSetting: [] }) })
    await loaded()
    expect(screen.getByText('固定金額')).toHaveAttribute('aria-pressed', 'true')
    const retrieve = screen.getAllByLabelText('換算金額')[1]
    expect(retrieve).toHaveValue(8)
    type(retrieve, '9')
    fireEvent.click(screen.getByText('固定金額'))
    fireEvent.click(save())
    await wait(() => expect(callsOf(calls, 'UPDATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(1))
    expect(sent(calls).updateSettingData).toEqual({ name: '分段互助', paidFixed: 30, retrievePointWay: 'FIXED', isAccordingToHelper: true, retrieveFixed: 9 })
    cleanup()

    const second = setup({ data: setting({ retrievePointWay: 'FIXED', retrieveFixed: 8, retrieveSegmentSetting: [] }) })
    await loaded()
    fireEvent.click(screen.getByText('全段'))
    fireEvent.click(save())
    await wait(() => expect(callsOf(second.calls, 'UPDATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(1))
    expect(sent(second.calls).updateSettingData).toEqual(
      expect.objectContaining({ retrievePointWay: 'NONSEGMENTED', retrieveSegmentSetting: [{ threshold: 0, price: 0 }] })
    )
  })

  it('後端回 false 提示儲存失敗；錯誤時提示錯誤；都可再按', async () => {
    setup({ UPDATE_MERCHANT_POINT_VALUE_SETTING: { updateMerchantPointValueSetting: false } })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '儲存失敗' }))
    expect(save()).toBeEnabled()
    cleanup()
    setup({ UPDATE_MERCHANT_POINT_VALUE_SETTING: new Error('設定使用中') })
    await loaded()
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '設定使用中' }))
    await wait(() => expect(save()).toBeEnabled())
  })

  // Jason 2026/10/22「照建議」：名稱必填，去掉前後空白後為空時提示且不送出，按鈕維持可按。
  it('名稱清空（含只有空白）時提示且不儲存', async () => {
    const utils = setup()
    await loaded()
    type(screen.getByLabelText('互助點數設定名稱'), '  ')
    fireEvent.click(save())
    expect(openSnackbar).toHaveBeenLastCalledWith({ variant: 'warning', message: '請輸入互助點數設定名稱' })
    await utils.settle()
    expect(callsOf(utils.calls, 'UPDATE_MERCHANT_POINT_VALUE_SETTING')).toHaveLength(0)
    expect(save()).toBeEnabled()
    expect(currentLocation()).toBe('/helper-point-setting/edit/hp1')
  })
})
