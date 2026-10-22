// 保護：新增／編輯抽成方式設定頁（兩頁各有一份 Results 與級距列，這裡用同一組情境逐頁驗證）。
// 抽成設定決定設計師薪資，重點是存檔送出的結構：
// - 全段（依類別分組，每組不分指定或分指定／不指定各自的級距）與分段（上下限＋抽成），存檔只送目前模式的資料、另一模式送空陣列；
// - 級距新增／刪除（第一列不能刪）、門檻與抽成的輸入範圍（門檻 0 以上、抽成 0～100，超出提示並歸 0；空白當 0）；
// - 切換類別分頁：新類別依目前是否分指定建立對應的空級距；回到已有資料的類別時，「分指定」跟著該類別的資料切換；
// - 存檔成功後提示並回到業績抽成參數頁。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實設定。
import React from 'react'
import { Route } from 'react-router-dom'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import CreateDeductionSetting from '..'
import UpdateDeductionSetting from '../../UpdateDeductionSetting'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const ATTRIBUTIONS = [
  { label: '預設', value: '預設' },
  { label: '剪髮', value: '剪髮' },
  { label: '染髮', value: '染髮' },
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

// 編輯頁：讀到的設定與新增頁的初始值相同（全段、預設組一列 0／0），兩頁之後的操作結果應一致
const EMPTY_SETTING = {
  id: 'ds-1',
  no: '',
  name: '',
  nonSegmented: [{ attribute: '預設', rakeData: { nonDistinguish: [{ threshold: 0, rake: 0 }], designate: [], nonDesignate: [] } }],
  segmented: [],
  isSegmented: false,
}

const PAGES = [
  {
    name: '新增抽成方式設定',
    mutation: 'CREATE_DEDUCTION_SETTING',
    saveLabel: '確認',
    successMessage: '新增成功',
    extra: {},
    mount: () =>
      renderPage(<CreateDeductionSetting />, {
        fixtures: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS }, CREATE_DEDUCTION_SETTING: { createDeductionSetting: true } },
        route: '/deduction-setting',
      }),
  },
  {
    name: '編輯抽成方式設定',
    mutation: 'UPDATE_DEDUCTION_SETTING',
    saveLabel: '儲存',
    successMessage: '更新成功',
    extra: { id: 'ds-1' },
    mount: () =>
      renderPage(<Route path="/update-deduction-setting/:id" component={UpdateDeductionSetting} />, {
        fixtures: {
          USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS },
          GET_DEDUCTION_SETTING: { getDeductionSetting: EMPTY_SETTING },
          UPDATE_DEDUCTION_SETTING: { updateDeductionSetting: true },
        },
        route: '/update-deduction-setting/ds-1',
      }),
  },
]

const numbers = () => [...document.querySelectorAll('input[type="number"]')]
const setNumber = (index, value) => fireEvent.change(numbers()[index], { target: { value: String(value) } })
const addButtons = () => screen.getAllByRole('button', { name: '新增級距' })
const deleteButtons = () => screen.queryAllByRole('button', { name: '刪除此級距' })
const tab = name => screen.getByRole('tab', { name })
async function openTab(name) {
  fireEvent.mouseDown(tab(name), { button: 0 })
  await wait(() => expect(tab(name)).toHaveAttribute('aria-selected', 'true'))
}
const designation = () => screen.getByLabelText('分指定/不指定')

describe.each(PAGES)('%#：$name', page => {
  async function setup() {
    const utils = page.mount()
    await utils.settle()
    return utils
  }
  async function saveAndGet(utils) {
    fireEvent.click(screen.getByRole('button', { name: page.saveLabel }))
    await wait(() => expect(callsOf(utils.calls, page.mutation)).toHaveLength(1))
    await wait(() => expect(window.location.href).toBe('/performanceDeductionParameter'))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: page.successMessage, variant: 'success' })
    return callsOf(utils.calls, page.mutation)[0].variables.input
  }

  it('全段不分指定：編號名稱、級距新增刪除、輸入範圍檢查，送出全段資料', async () => {
    const utils = await setup()
    const [no, name] = screen.getAllByRole('textbox')
    fireEvent.change(no, { target: { value: 'D01' } })
    fireEvent.change(name, { target: { value: '設計師抽成' } })
    // 第一列沒有刪除鈕
    expect(deleteButtons()).toHaveLength(0)
    setNumber(0, 1000)
    setNumber(1, 150)
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入0~100之間的數字', variant: 'warning' })
    setNumber(1, 10.5)
    fireEvent.click(addButtons()[0])
    setNumber(2, -5)
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請輸入0以上的數字', variant: 'warning' })
    setNumber(2, 50000)
    setNumber(3, '')
    fireEvent.click(addButtons()[0])
    expect(numbers()).toHaveLength(6)
    fireEvent.click(deleteButtons()[1])
    numbers().forEach(input => fireEvent.wheel(input))
    const input = await saveAndGet(utils)
    expect(input).toEqual({
      ...page.extra,
      deductionNo: 'D01',
      deductionName: '設計師抽成',
      nonSegmented: [
        {
          attribute: '預設',
          rakeData: {
            nonDistinguish: [
              { threshold: 1000, rake: 10.5 },
              { threshold: 50000, rake: 0 },
            ],
            designate: [],
            nonDesignate: [],
          },
        },
      ],
      segmented: [],
    })
  })

  it('全段依類別：新類別建立空級距、回到預設組；分指定時各自的級距', async () => {
    const utils = await setup()
    setNumber(1, 5)
    await openTab('剪髮')
    expect(numbers().map(i => i.value)).toEqual(['0', '0'])
    setNumber(0, 300)
    setNumber(1, 20)
    await openTab('預設')
    expect(numbers().map(i => i.value)).toEqual(['0', '5'])
    // 預設組改分指定：指定、不指定各一列
    fireEvent.click(designation())
    expect(screen.getByText('指定業績')).toBeInTheDocument()
    expect(numbers()).toHaveLength(4)
    setNumber(0, 100)
    setNumber(1, 30)
    setNumber(2, 200)
    setNumber(3, 25)
    setNumber(0, -1)
    setNumber(1, 101)
    setNumber(2, -1)
    setNumber(3, -2)
    setNumber(0, 100)
    setNumber(1, 30)
    setNumber(2, 200)
    setNumber(3, 25)
    // 指定、不指定各新增一列再刪除
    fireEvent.click(addButtons()[0])
    fireEvent.click(addButtons()[1])
    expect(numbers()).toHaveLength(8)
    setNumber(2, 1000)
    setNumber(3, 35)
    const dels = deleteButtons()
    expect(dels).toHaveLength(2)
    fireEvent.click(dels[1])
    numbers().forEach(i => fireEvent.wheel(i))
    // 分指定時切到新類別：新類別建立指定／不指定的空級距
    await openTab('染髮')
    expect(numbers()).toHaveLength(4)
    const input = await saveAndGet(utils)
    expect(input.segmented).toEqual([])
    expect(input.nonSegmented).toEqual([
      {
        attribute: '預設',
        rakeData: {
          designate: [
            { threshold: 100, rake: 30 },
            { threshold: 1000, rake: 35 },
          ],
          nonDesignate: [{ threshold: 200, rake: 25 }],
          nonDistinguish: [],
        },
      },
      { attribute: '剪髮', rakeData: { designate: [], nonDesignate: [], nonDistinguish: [{ threshold: 300, rake: 20 }] } },
      {
        attribute: '染髮',
        rakeData: { designate: [{ threshold: 0, rake: 0 }], nonDesignate: [{ threshold: 0, rake: 0 }], nonDistinguish: [] },
      },
    ])
  })

  it('回到已有資料的類別時，「分指定」跟著該類別的資料切換', async () => {
    await setup()
    // 剪髮：不分指定
    await openTab('剪髮')
    await openTab('預設')
    // 預設改分指定，切到剪髮（該組是不分指定資料）→ 取消分指定
    fireEvent.click(designation())
    expect(designation()).toBeChecked()
    await openTab('剪髮')
    expect(designation()).not.toBeChecked()
    expect(numbers()).toHaveLength(2)
    // 再回預設（該組是分指定資料）→ 恢復分指定
    await openTab('預設')
    expect(designation()).toBeChecked()
    expect(numbers()).toHaveLength(4)
    // 分指定時切到同樣分指定的新類別，再回預設：維持分指定
    await openTab('染髮')
    await openTab('預設')
    expect(designation()).toBeChecked()
    // 不分指定的類別之間切換：維持不分指定
    fireEvent.click(designation())
    await openTab('剪髮')
    expect(designation()).not.toBeChecked()
  })

  it('分段不分指定：上下限與抽成、新增刪除，送出分段資料（全段送空陣列）', async () => {
    const utils = await setup()
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    // 分段沒有類別分頁
    expect(screen.queryByRole('tab', { name: '剪髮' })).toBeNull()
    expect(numbers()).toHaveLength(3)
    setNumber(0, 0)
    setNumber(1, 10000)
    setNumber(2, 8)
    setNumber(0, -1)
    setNumber(1, -1)
    fireEvent.click(addButtons()[0])
    setNumber(3, 10000)
    setNumber(4, 30000)
    setNumber(5, 12)
    fireEvent.click(addButtons()[0])
    fireEvent.click(deleteButtons()[1])
    setNumber(1, 10000)
    numbers().forEach(i => fireEvent.wheel(i))
    const input = await saveAndGet(utils)
    expect(input.nonSegmented).toEqual([])
    expect(input.segmented).toEqual([
      {
        designate: [],
        nonDesignate: [],
        nonDistinguish: [
          { thresholdLowerLimit: 0, thresholdUpperLimit: 10000, rake: 8 },
          { thresholdLowerLimit: 10000, thresholdUpperLimit: 30000, rake: 12 },
        ],
      },
    ])
  })

  it('分段分指定：指定與不指定各自分段，新增刪除；切回全段時回到預設組', async () => {
    const utils = await setup()
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    fireEvent.click(designation())
    expect(screen.getByText('指定業績')).toBeInTheDocument()
    expect(numbers()).toHaveLength(6)
    ;[0, 5000, 10, 100, 6000, 8].forEach((v, i) => setNumber(i, v))
    ;[-1, -1, 120].forEach((v, i) => setNumber(i, v))
    ;[-1, -1, 120].forEach((v, i) => setNumber(i + 3, v))
    ;[0, 5000, 10, 100, 6000, 8].forEach((v, i) => setNumber(i, v))
    fireEvent.click(addButtons()[0])
    fireEvent.click(addButtons()[1])
    expect(numbers()).toHaveLength(12)
    ;[5000, 9000, 15].forEach((v, i) => setNumber(3 + i, v))
    const dels = deleteButtons()
    expect(dels).toHaveLength(2)
    fireEvent.click(dels[1])
    numbers().forEach(i => fireEvent.wheel(i))
    const input = await saveAndGet(utils)
    expect(input.nonSegmented).toEqual([])
    expect(input.segmented).toEqual([
      {
        designate: [
          { thresholdLowerLimit: 0, thresholdUpperLimit: 5000, rake: 10 },
          { thresholdLowerLimit: 5000, thresholdUpperLimit: 9000, rake: 15 },
        ],
        nonDesignate: [{ thresholdLowerLimit: 100, thresholdUpperLimit: 6000, rake: 8 }],
        nonDistinguish: [],
      },
    ])
  })

  it('分指定時刪除指定業績的級距（全段與分段）', async () => {
    const utils = await setup()
    fireEvent.click(designation())
    fireEvent.click(addButtons()[0])
    setNumber(2, 800)
    fireEvent.click(deleteButtons()[0])
    expect(numbers()).toHaveLength(4)
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    fireEvent.click(designation())
    fireEvent.click(designation())
    fireEvent.click(addButtons()[0])
    expect(numbers()).toHaveLength(9)
    fireEvent.click(deleteButtons()[0])
    const input = await saveAndGet(utils)
    expect(input.segmented[0].designate).toHaveLength(1)
    expect(input.segmented[0].nonDesignate).toHaveLength(1)
  })

  it('分段分指定取消分指定、切回全段：回到預設組一列', async () => {
    await setup()
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    fireEvent.click(designation())
    fireEvent.click(designation())
    expect(numbers()).toHaveLength(3)
    fireEvent.click(designation())
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    expect(tab('預設')).toHaveAttribute('aria-selected', 'true')
    expect(numbers()).toHaveLength(4)
    fireEvent.click(designation())
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    expect(numbers()).toHaveLength(2)
  })
})

describe('新增頁：類別值為空字串', () => {
  it('切到值為空字串的類別後再切換：該組改稱「預設」（與編輯頁處理舊資料相同）', async () => {
    const utils = renderPage(<CreateDeductionSetting />, {
      fixtures: {
        USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: [...ATTRIBUTIONS, { label: '未分類', value: '' }] },
        CREATE_DEDUCTION_SETTING: { createDeductionSetting: true },
      },
    })
    await utils.settle()
    fireEvent.mouseDown(screen.getByRole('tab', { name: '未分類' }), { button: 0 })
    await wait(() => expect(numbers()).toHaveLength(2))
    await openTab('剪髮')
    fireEvent.click(screen.getByRole('button', { name: '確認' }))
    await wait(() => expect(callsOf(utils.calls, 'CREATE_DEDUCTION_SETTING')).toHaveLength(1))
    expect(callsOf(utils.calls, 'CREATE_DEDUCTION_SETTING')[0].variables.input.nonSegmented.map(d => d.attribute)).toEqual([
      '預設',
      '預設',
      '剪髮',
    ])
  })
})

describe('新增頁：類別清單讀取', () => {
  it('讀取中顯示骨架；讀取失敗不整頁錯誤（沒有類別分頁，仍可設定預設組）', async () => {
    const { PAGE_CRASH_TEXT } = require('../../../__tests__/testkit.test')
    let utils = renderPage(<CreateDeductionSetting />, {
      fixtures: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: { getAttributionForRake: ATTRIBUTIONS } },
      delays: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: 500 },
    })
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3)
    await utils.settle()
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(0)
    cleanup()
    utils = renderPage(<CreateDeductionSetting />, { fixtures: { USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE: new Error('類別讀取失敗') } })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(numbers()).toHaveLength(2)
  })
})
