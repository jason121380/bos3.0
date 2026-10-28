// 保護：編輯抽成方式設定頁讀入既有設定。
// - 依讀到的資料判斷全段／分段、是否分指定，畫面與存檔沿用原資料（含 id、編號、名稱）；沒有全段資料時補預設組一列；
// - 設定比類別清單晚回來時不整頁錯誤（類別清單常已在快取中，會先回來）；讀不到設定時不整頁錯誤、也不能存檔（避免把空白設定蓋回去）；
// - 舊資料類別名稱空白時，切換類別會改稱「預設」。
// 新增／編輯共同的操作情境見 CreateDeductionSetting/__tests__/deductionSetting.page.test.js。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實設定。
import React from 'react'
import { Route } from 'react-router-dom'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import UpdateDeductionSetting from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const ATTRIBUTIONS = [
  { label: '預設', value: '預設' },
  { label: '剪髮', value: '剪髮' },
]

const realLocation = window.location
beforeEach(() => {
  loginAs()
  delete window.location
  window.location = { ...realLocation, href: '' }
})
afterEach(() => {
  window.location = realLocation
  cleanup()
})

const seg = (lower, upper, rake) => ({ thresholdLowerLimit: lower, thresholdUpperLimit: upper, rake })
const tier = (threshold, rake) => ({ threshold, rake })

function mount(setting, { fixtures = {}, ...options } = {}) {
  return renderPage(<Route path="/update-deduction-setting/:id" component={UpdateDeductionSetting} />, {
    fixtures: {
      USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS },
      GET_DEDUCTION_SETTING: { getDeductionSetting: setting },
      UPDATE_DEDUCTION_SETTING: { updateDeductionSetting: true },
      ...fixtures,
    },
    route: '/update-deduction-setting/ds-9',
    ...options,
  })
}
const numbers = () => [...document.querySelectorAll('input[type="number"]')].map(i => i.value)
const designation = () => screen.getByLabelText('分指定/不指定')
const segmentedButton = () => screen.getByTestId('assign-designer-true')
async function saved(utils) {
  fireEvent.click(screen.getByRole('button', { name: '儲存' }))
  await wait(() => expect(callsOf(utils.calls, 'UPDATE_DEDUCTION_SETTING')).toHaveLength(1))
  return callsOf(utils.calls, 'UPDATE_DEDUCTION_SETTING')[0].variables.input
}

describe('讀入既有設定', () => {
  it('全段分指定：帶入編號名稱與兩組級距，以網址的 id 查詢與存檔', async () => {
    const setting = {
      id: 'ds-9',
      no: 'D09',
      name: '資深設計師',
      nonSegmented: [
        { attribute: '預設', rakeData: { designate: [tier(0, 30)], nonDesignate: [tier(0, 20)], nonDistinguish: [] } },
        { attribute: '剪髮', rakeData: { designate: [tier(1000, 35)], nonDesignate: [tier(1000, 25)], nonDistinguish: [] } },
      ],
      segmented: [],
      isSegmented: false,
    }
    const utils = mount(setting)
    await utils.settle()
    expect(callsOf(utils.calls, 'GET_DEDUCTION_SETTING')[0].variables).toEqual({ DeductionSettingId: 'ds-9' })
    expect(screen.getAllByRole('textbox').map(i => i.value)).toEqual(['D09', '資深設計師'])
    expect(designation()).toBeChecked()
    expect(segmentedButton()).toHaveAttribute('aria-pressed', 'false')
    expect(numbers()).toEqual(['0', '30', '0', '20'])
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: '資深設計師 A' } })
    const input = await saved(utils)
    expect(input).toEqual({ id: 'ds-9', deductionNo: 'D09', deductionName: '資深設計師 A', nonSegmented: setting.nonSegmented, segmented: [] })
  })

  it.each([
    ['指定分段', { designate: [seg(0, 100, 10)], nonDesignate: [seg(0, 100, 5)], nonDistinguish: [] }, true],
    ['只有不指定分段', { designate: [], nonDesignate: [seg(0, 100, 5)], nonDistinguish: [] }, false],
    ['不分指定分段', { designate: [], nonDesignate: [], nonDistinguish: [seg(0, 50000, 12)] }, false],
  ])('分段（%s）：判斷為分段，全段補預設組；存檔只送分段資料', async (_, segment, designationUsage) => {
    const utils = mount({ id: 'ds-9', no: 'S1', name: '分段', nonSegmented: [], segmented: [segment], isSegmented: true })
    await utils.settle()
    expect(segmentedButton()).toHaveAttribute('aria-pressed', 'true')
    expect(designation().checked).toBe(designationUsage)
    const input = await saved(utils)
    expect(input.nonSegmented).toEqual([])
    expect(input.segmented).toEqual([segment])
  })

  it('沒有任何級距資料：全段補預設組一列', async () => {
    const utils = mount({ id: 'ds-9', no: 'E', name: '空', nonSegmented: [], segmented: [], isSegmented: false })
    await utils.settle()
    expect(segmentedButton()).toHaveAttribute('aria-pressed', 'false')
    expect(designation()).not.toBeChecked()
    expect(numbers()).toEqual(['0', '0'])
    const input = await saved(utils)
    expect(input.nonSegmented).toEqual([{ attribute: '預設', rakeData: { nonDistinguish: [tier(0, 0)], designate: [], nonDesignate: [] } }])
  })

  it('舊資料類別名稱空白（或缺）時，切換類別後改稱「預設」', async () => {
    const utils = mount({
      id: 'ds-9',
      no: 'O',
      name: '舊',
      nonSegmented: [{ attribute: '', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [tier(0, 15)] } }],
      segmented: [],
      isSegmented: false,
    })
    await utils.settle()
    fireEvent.mouseDown(screen.getByRole('tab', { name: '剪髮' }), { button: 0 })
    await wait(() => expect(screen.getByRole('tab', { name: '剪髮' })).toHaveAttribute('aria-selected', 'true'))
    const input = await saved(utils)
    expect(input.nonSegmented.map(d => d.attribute)).toEqual(['預設', '剪髮'])
  })
})

describe('讀取順序與查詢失敗', () => {
  it('設定比類別清單晚回來：不整頁錯誤，回來後顯示設定', async () => {
    const utils = mount(
      {
        id: 'ds-9',
        no: 'L',
        name: '晚到',
        nonSegmented: [{ attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [tier(500, 18)] } }],
        segmented: [],
        isSegmented: false,
      },
      { delays: { GET_DEDUCTION_SETTING: 1500 } }
    )
    await wait(() => expect(callsOf(utils.calls, 'USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE')).toHaveLength(1))
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    // 設定還沒回來前不能存檔（避免把空白設定蓋回去）
    expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled()
    await utils.settle()
    await wait(() => expect(numbers()).toEqual(['500', '18']))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })

  // 2026/10/28：查詢失敗（網路或後端錯誤）改顯示可重試的錯誤狀態，不再顯示空白表單／空列表，避免誤以為沒有資料或把空值存回去
  it('讀不到設定：顯示無法載入資料與重新查詢，不進錯誤畫面', async () => {
    const utils = mount(null, { fixtures: { GET_DEDUCTION_SETTING: new Error('找不到抽成設定') } })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.getAllByText('無法載入資料')[0]).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '重新查詢' })[0]).toBeEnabled()
  })

  it('類別清單讀取失敗：不整頁錯誤（沒有類別分頁）', async () => {
    const utils = mount(
      {
        id: 'ds-9',
        no: 'A',
        name: '無類別',
        nonSegmented: [{ attribute: '預設', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [tier(0, 10)] } }],
        segmented: [],
        isSegmented: false,
      },
      { fixtures: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: new Error('類別讀取失敗') } }
    )
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(numbers()).toEqual(['0', '10'])
  })
})
