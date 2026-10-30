// 保護：業績抽成參數設定頁（服務扣項方式命名、人員身分類別、互助類別名稱、抽成方式設定列表、互助點數設定列表）。
// - 一次只能編輯一個區塊；儲存前檢查（扣項依據必選、名稱不可重複、人員類別要有預設、名稱必填），送出的欄位與 id 對應
//   （「無扣項／無抽成／無互助」送 null）；成功、後端回 false、失敗各自提示並結束編輯；
// - 服務扣項存檔後，人員身分類別的「服務扣項依據方式」選項同步更新；
// - 抽成方式與互助點數列表：勾選（單筆、全選）後刪除送出 id，刪除後列表不再顯示被刪的資料；
// - 查詢失敗時不整頁錯誤；讀取中顯示骨架。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import PerformanceDeductionParameter from '..'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const COMMISSION = [
  { id: 'cw-1', name: '一般', basisForDeduction: 'BYORIGIN' },
  { id: 'cw-2', name: '刷卡', basisForDeduction: 'BYFIXED' },
]
const DEDUCTIONS = [
  { id: 'd-1', no: 'D01', name: '設計師抽成' },
  { id: 'd-2', no: 'D02', name: '助理抽成' },
]
const POINTS = [
  { id: 'p-1', name: '洗髮互助', paidFixed: 1200, retrievePointWay: 'FIXED' },
  { id: 'p-2', name: '吹整互助', paidFixed: 0, retrievePointWay: 'NONSEGMENTED' },
  { id: 'p-3', name: '染髮互助', paidFixed: 30, retrievePointWay: 'SEGMENTED' },
  { id: 'p-4', name: '其他', paidFixed: 5, retrievePointWay: 'UNKNOWN' },
]
const JOB_TITLES = [
  {
    id: 'j-1',
    jobTitle: '設計師',
    pointValue: 10,
    DeductionSettingId: 'd-1',
    MerchantCommissionWayId: 'cw-1',
    merchantPointValueSettingId: null,
    isDefaultValue: true,
    usingPeopleCount: 3,
  },
  {
    id: 'j-2',
    jobTitle: '助理',
    pointValue: 5,
    DeductionSettingId: null,
    MerchantCommissionWayId: null,
    merchantPointValueSettingId: 'p-1',
    isDefaultValue: false,
    usingPeopleCount: 0,
  },
]

const fixtures = (overrides = {}) => ({
  MERCHANT_COMMISSION_WAY: { merchantCommissionWay: COMMISSION },
  GET_MULTIPLE_DEDUCTION_SETTINGS: { getDeductionSettings: DEDUCTIONS },
  GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT: { getMerchantPointValueSettings: POINTS },
  MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: JOB_TITLES },
  MERCHANT_HELPER_ITEMS: { merchantHelperItems: [{ type: '洗髮', name: '洗髮' }] },
  SETTING_COMMISSION_WAY: { settingCommissionWay: true },
  setting_JobTitle_Point: { settingJobTitlePoint: true },
  SET_HELPER_CATEGORY: { setHelperCategory: true },
  ...overrides,
})

async function setup(overrides, options = {}) {
  const utils = renderPage(<PerformanceDeductionParameter />, { fixtures: fixtures(overrides), route: '/performanceDeductionParameter', ...options })
  await utils.settle()
  return utils
}
const sentVars = (calls, name) => {
  const list = callsOf(calls, name)
  return list[list.length - 1].variables
}
async function openTab(label) {
  const tab = screen.getByRole('tab', { name: label })
  fireEvent.mouseDown(tab, { button: 0 })
  await wait(() => expect(tab).toHaveAttribute('aria-selected', 'true'))
}
const cardOf = title => [...document.querySelectorAll('h3')].find(h => h.textContent === title).closest('.rounded-2xl')
const pick = (select, text) => {
  const option = [...select.options].find(o => o.textContent === text)
  if (!option) throw new Error(`下拉沒有選項「${text}」`)
  fireEvent.change(select, { target: { value: option.value } })
}
const selectedText = select => (select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent : '')
const editButton = card => within(card).getByRole('button', { name: '編輯' })

describe('服務扣項方式命名', () => {
  it('編輯中其他區塊不能編輯；新增列須選依據、名稱不可重複，送出名稱與依據', async () => {
    const utils = await setup()
    const card = cardOf('服務扣項方式命名')
    const names = () => within(card).getAllByRole('textbox')
    expect(names().map(i => i.value)).toEqual(['一般', '刷卡'])
    expect(names()[0]).toBeDisabled()
    fireEvent.click(editButton(card))
    expect(names()[0]).not.toBeDisabled()
    // 其他區塊的「編輯」停用
    expect(editButton(cardOf('人員身分類別設定'))).toBeDisabled()
    expect(editButton(cardOf('互助類別名稱設定'))).toBeDisabled()
    // 新增一列：未選依據時不能存
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    fireEvent.change(names()[2], { target: { value: '一般' } })
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '服務扣項名稱已被重複', variant: 'error' })
    fireEvent.change(names()[2], { target: { value: '轉帳' } })
    // 新列的依據顯示空白（未選），不是預設第一個選項
    const basis = () => card.querySelectorAll('select')
    expect(selectedText(basis()[2])).toBe('')
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇服務扣項依據方式', variant: 'error' })
    expect(callsOf(utils.calls, 'SETTING_COMMISSION_WAY')).toHaveLength(0)
    pick(basis()[2], '依原業績')
    pick(basis()[1], '依原業績')
    // 刪除第一列
    fireEvent.click(within(card).getAllByRole('button', { name: '刪除' })[0])
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯成功', variant: 'success' }))
    expect(sentVars(utils.calls, 'SETTING_COMMISSION_WAY')).toEqual({
      input: [
        { name: '刷卡', basisForDeduction: 'BYORIGIN' },
        { name: '轉帳', basisForDeduction: 'BYORIGIN' },
      ],
    })
    // 存檔後重抓、結束編輯
    await wait(() => expect(callsOf(utils.calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
    expect(editButton(card)).toBeInTheDocument()
    expect(editButton(cardOf('人員身分類別設定'))).not.toBeDisabled()
  })

  it('後端回 false 提示編輯失敗、失敗時顯示錯誤；兩者都結束編輯', async () => {
    await setup({ SETTING_COMMISSION_WAY: { settingCommissionWay: false } })
    const card = cardOf('服務扣項方式命名')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯失敗', variant: 'warning' }))
    expect(editButton(card)).toBeInTheDocument()
    cleanup()
    await setup({ SETTING_COMMISSION_WAY: new Error('名稱過長') })
    const card2 = cardOf('服務扣項方式命名')
    fireEvent.click(editButton(card2))
    fireEvent.click(within(card2).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '名稱過長', variant: 'error' }))
    expect(editButton(card2)).toBeInTheDocument()
  })

  it('沒有扣項方式時顯示一列空白；只有一列時沒有刪除鈕', async () => {
    await setup({ MERCHANT_COMMISSION_WAY: { merchantCommissionWay: [] } })
    const card = cardOf('服務扣項方式命名')
    expect(
      within(card)
        .getAllByRole('textbox')
        .map(i => i.value)
    ).toEqual([''])
    expect(within(card).queryByRole('button', { name: '刪除' })).toBeNull()
  })

  it('存檔後，人員身分類別的「服務扣項依據方式」選項同步更新', async () => {
    let commissionCalls = 0
    const utils = await setup({
      MERCHANT_COMMISSION_WAY: () => {
        commissionCalls += 1
        return {
          merchantCommissionWay: commissionCalls === 1 ? COMMISSION : [...COMMISSION, { id: 'cw-3', name: '轉帳', basisForDeduction: 'BYORIGIN' }],
        }
      },
    })
    const card = cardOf('服務扣項方式命名')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    fireEvent.change(within(card).getAllByRole('textbox')[2], { target: { value: '轉帳' } })
    pick(card.querySelectorAll('select')[2], '依原業績')
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(callsOf(utils.calls, 'MERCHANT_COMMISSION_WAY')).toHaveLength(2))
    await utils.settle()
    await openTab('人員身分類別')
    const way = cardOf('人員身分類別設定').querySelectorAll('select')[0]
    await wait(() => expect([...way.options].map(o => o.textContent)).toEqual(['無扣項', '一般', '刷卡', '轉帳']))
  })
})

describe('人員身分類別設定', () => {
  it('帶入原設定；使用中的類別不能刪；修改後送出（無扣項／無抽成／無互助送 null）', async () => {
    const utils = await setup()
    await openTab('人員身分類別')
    const card = cardOf('人員身分類別設定')
    const rowSelects = () => card.querySelectorAll('select')
    expect(selectedText(rowSelects()[0])).toBe('一般')
    expect(selectedText(rowSelects()[1])).toBe('設計師抽成')
    expect(selectedText(rowSelects()[2])).toBe('無互助')
    expect(selectedText(rowSelects()[3])).toBe('無扣項')
    expect(selectedText(rowSelects()[5])).toBe('洗髮互助')
    expect(card).toHaveTextContent('人數: 3人')
    expect(card).toHaveTextContent('使用中無法刪除')
    // 有使用中的列時，刪除鈕加寬與「使用中」文字對齊
    expect(within(card).getByRole('button', { name: '刪除' }).className).toContain('w-[112px]')
    fireEvent.click(editButton(card))
    expect(editButton(cardOf('互助類別名稱設定'))).toBeDisabled()
    const titles = () => within(card).getAllByRole('textbox')
    fireEvent.change(titles()[1], { target: { name: 'jobTitle', value: '資深助理' } })
    pick(rowSelects()[3], '刷卡')
    pick(rowSelects()[4], '助理抽成')
    pick(rowSelects()[2], '染髮互助')
    pick(rowSelects()[0], '無扣項')
    // 預設改為第 2 列
    fireEvent.click(within(card).getAllByRole('radio')[1])
    // 新增一列再刪掉（未使用的類別可刪）
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    expect(titles()).toHaveLength(3)
    fireEvent.click(within(card).getAllByRole('button', { name: '刪除' }).pop())
    expect(titles()).toHaveLength(2)
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯成功', variant: 'success' }))
    expect(sentVars(utils.calls, 'setting_JobTitle_Point')).toEqual({
      input: [
        { jobTitle: '設計師', pointValue: 10, deductionId: 'd-1', commissionWayId: null, merchantPointValueSettingId: 'p-3', isDefaultValue: false },
        {
          jobTitle: '資深助理',
          pointValue: 5,
          deductionId: 'd-2',
          commissionWayId: 'cw-2',
          merchantPointValueSettingId: 'p-1',
          isDefaultValue: true,
        },
      ],
    })
    await wait(() => expect(callsOf(utils.calls, 'MERCHANT_JOBTITLE_POINT')).toHaveLength(2))
    expect(editButton(card)).toBeInTheDocument()
  })

  it('儲存前檢查：要有預設類別、名稱必填、名稱不可重複', async () => {
    const utils = await setup({
      MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: JOB_TITLES.map(j => ({ ...j, isDefaultValue: false, usingPeopleCount: 0 })) },
    })
    await openTab('人員身分類別')
    const card = cardOf('人員身分類別設定')
    // 都沒有人使用：每列都有刪除鈕（不需為「使用中」文字預留寬度）
    expect(
      within(card)
        .getAllByRole('button', { name: '刪除' })
        .map(b => b.className.includes('w-[112px]'))
    ).toEqual([false, false])
    fireEvent.click(editButton(card))
    const save = () => fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請選擇預設的人員類別', variant: 'error' })
    fireEvent.click(within(card).getAllByRole('radio')[0])
    // 新增一列不填名稱
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '請填寫人員設定的名稱', variant: 'error' })
    fireEvent.change(within(card).getAllByRole('textbox')[2], { target: { name: 'jobTitle', value: '助理' } })
    save()
    expect(openSnackbar).toHaveBeenLastCalledWith({ message: '人員類別設定的名稱已被重複', variant: 'error' })
    expect(callsOf(utils.calls, 'setting_JobTitle_Point')).toHaveLength(0)
  })

  it('後端回 false 提示編輯失敗；失敗時顯示錯誤', async () => {
    await setup({ setting_JobTitle_Point: { settingJobTitlePoint: false } })
    await openTab('人員身分類別')
    let card = cardOf('人員身分類別設定')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯失敗', variant: 'warning' }))
    cleanup()
    await setup({ setting_JobTitle_Point: new Error('權限不足') })
    await openTab('人員身分類別')
    card = cardOf('人員身分類別設定')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '權限不足', variant: 'error' }))
    expect(editButton(card)).toBeInTheDocument()
  })

  it('沒有類別、扣項方式時各顯示一列空白；只有一列時沒有刪除鈕', async () => {
    await setup({
      MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: [] },
      MERCHANT_COMMISSION_WAY: { merchantCommissionWay: [] },
      MERCHANT_HELPER_ITEMS: { merchantHelperItems: [] },
    })
    await openTab('人員身分類別')
    const card = cardOf('人員身分類別設定')
    expect(
      within(card)
        .getAllByRole('textbox')
        .map(i => i.value)
    ).toEqual([''])
    expect(within(card).queryByRole('button', { name: '刪除' })).toBeNull()
    expect(
      within(cardOf('互助類別名稱設定'))
        .getAllByRole('textbox')
        .map(i => i.value)
    ).toEqual([''])
  })
})

describe('互助類別名稱設定', () => {
  it('修改、新增（空白名稱）、刪除後送出', async () => {
    const utils = await setup()
    await openTab('人員身分類別')
    const card = cardOf('互助類別名稱設定')
    fireEvent.click(editButton(card))
    expect(editButton(cardOf('人員身分類別設定'))).toBeDisabled()
    const inputs = () => within(card).getAllByRole('textbox')
    fireEvent.change(inputs()[0], { target: { value: '洗頭' } })
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    // 新增的列是空白（受控欄位）
    expect(inputs()[1]).toHaveValue('')
    fireEvent.change(inputs()[1], { target: { value: '吹髮' } })
    // 再新增一列空白、刪掉第一列
    fireEvent.click(within(card).getAllByRole('button', { name: '新增' }).pop())
    fireEvent.click(within(card).getAllByRole('button', { name: '刪除' })[0])
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯成功', variant: 'success' }))
    // 新增的空白列送出 type 空字串（不是缺欄位的空物件）
    expect(sentVars(utils.calls, 'SET_HELPER_CATEGORY')).toEqual({ input: [{ type: '吹髮' }, { type: '' }] })
    await wait(() => expect(callsOf(utils.calls, 'MERCHANT_HELPER_ITEMS')).toHaveLength(2))
  })

  it('後端回 false 提示編輯失敗；失敗時顯示錯誤', async () => {
    await setup({ SET_HELPER_CATEGORY: { setHelperCategory: false } })
    await openTab('人員身分類別')
    let card = cardOf('互助類別名稱設定')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '編輯失敗', variant: 'warning' }))
    cleanup()
    await setup({ SET_HELPER_CATEGORY: new Error('名稱重複') })
    await openTab('人員身分類別')
    card = cardOf('互助類別名稱設定')
    fireEvent.click(editButton(card))
    fireEvent.click(within(card).getByRole('button', { name: '儲存' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '名稱重複', variant: 'error' }))
  })
})

describe('抽成方式設定列表', () => {
  it('列表、編輯連結；勾選單筆與全選；刪除送出 id 後列表不再顯示', async () => {
    let listCalls = 0
    const utils = await setup({
      GET_MULTIPLE_DEDUCTION_SETTINGS: () => {
        listCalls += 1
        return { getDeductionSettings: listCalls === 1 ? DEDUCTIONS : [DEDUCTIONS[1]] }
      },
      DELETE_DEDUCTION_SETTING: { deleteDeductionSetting: true },
    })
    await openTab('抽成方式設定')
    const card = cardOf('抽成方式設定')
    expect(within(card).getByRole('link', { name: '新增' })).toHaveAttribute('href', '/deduction-setting')
    expect(screen.getByTestId('update-deduction-setting-0')).toHaveAttribute('href', '/update-deduction-setting/d-1')
    const all = within(card).getByRole('checkbox', { name: '全選' })
    fireEvent.click(all)
    expect(within(card).getByText('已選 2 筆')).toBeInTheDocument()
    fireEvent.click(all)
    expect(within(card).getByRole('toolbar', { hidden: true }).parentElement).not.toBeVisible()
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 助理抽成' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 設計師抽成' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 助理抽成' }))
    fireEvent.click(within(card).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '刪除成功抽成方式設定', variant: 'success' }))
    expect(sentVars(utils.calls, 'DELETE_DEDUCTION_SETTING')).toEqual({ DeductionId: ['d-1'] })
    await wait(() => expect(within(cardOf('抽成方式設定')).queryByText('設計師抽成')).toBeNull())
  })

  it('刪除失敗時顯示錯誤並清除勾選；沒有資料時全選停用', async () => {
    await setup({ DELETE_DEDUCTION_SETTING: new Error('使用中無法刪除') })
    await openTab('抽成方式設定')
    const card = cardOf('抽成方式設定')
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 設計師抽成' }))
    fireEvent.click(within(card).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '使用中無法刪除', variant: 'error' }))
    expect(within(card).getByRole('checkbox', { name: '選取 設計師抽成' })).not.toBeChecked()
    cleanup()
    await setup({ GET_MULTIPLE_DEDUCTION_SETTINGS: { getDeductionSettings: [] } })
    await openTab('抽成方式設定')
    expect(within(cardOf('抽成方式設定')).getByRole('checkbox', { name: '全選' })).toBeDisabled()
  })
})

describe('互助點數設定列表', () => {
  it('類型與換算金額顯示；刪除成功送出 id 後列表不再顯示', async () => {
    let listCalls = 0
    const utils = await setup({
      GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT: () => {
        listCalls += 1
        return { getMerchantPointValueSettings: listCalls === 1 ? POINTS : POINTS.slice(1) }
      },
      DELETE_MERCHANT_POINT_VALUE_SETTING: { deleteMerchantPointValueSetting: true },
    })
    await openTab('互助點數設定')
    const card = cardOf('互助點數設定')
    expect(within(card).getByRole('link', { name: '新增' })).toHaveAttribute('href', '/helper-point-setting-create')
    expect(screen.getByTestId('helper-point-setting-edit-0')).toHaveAttribute('href', '/helper-point-setting-edit/p-1')
    const rows = within(card).getAllByTestId('table-row')
    expect(rows[0]).toHaveTextContent('固定金額')
    expect(rows[0]).toHaveTextContent('1,200')
    expect(rows[1]).toHaveTextContent('全段')
    expect(rows[2]).toHaveTextContent('分段')
    fireEvent.click(within(card).getByRole('checkbox', { name: '全選' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '全選' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 洗髮互助' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 其他' }))
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 其他' }))
    fireEvent.click(within(card).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '刪除成功', variant: 'success' }))
    expect(sentVars(utils.calls, 'DELETE_MERCHANT_POINT_VALUE_SETTING')).toEqual({ input: ['p-1'] })
    await wait(() => expect(within(cardOf('互助點數設定')).queryByText('洗髮互助')).toBeNull())
  })

  it('後端回 false 提示刪除失敗並保留勾選；失敗時顯示錯誤並清除勾選', async () => {
    await setup({ DELETE_MERCHANT_POINT_VALUE_SETTING: { deleteMerchantPointValueSetting: false } })
    await openTab('互助點數設定')
    let card = cardOf('互助點數設定')
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 洗髮互助' }))
    fireEvent.click(within(card).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '刪除失敗', variant: 'warning' }))
    expect(within(card).getByRole('checkbox', { name: '選取 洗髮互助' })).toBeChecked()
    cleanup()
    await setup({ DELETE_MERCHANT_POINT_VALUE_SETTING: new Error('使用中') })
    await openTab('互助點數設定')
    card = cardOf('互助點數設定')
    fireEvent.click(within(card).getByRole('checkbox', { name: '選取 洗髮互助' }))
    fireEvent.click(within(card).getByRole('button', { name: '刪除' }))
    await wait(() => expect(openSnackbar).toHaveBeenLastCalledWith({ message: '使用中', variant: 'error' }))
    expect(within(card).getByRole('checkbox', { name: '選取 洗髮互助' })).not.toBeChecked()
  })
})

describe('讀取中與查詢失敗', () => {
  it('讀取中各區塊顯示骨架、「編輯」停用', async () => {
    const delay = 1500
    const utils = renderPage(<PerformanceDeductionParameter />, {
      fixtures: fixtures(),
      delays: {
        MERCHANT_COMMISSION_WAY: delay,
        MERCHANT_JOBTITLE_POINT: delay,
        MERCHANT_HELPER_ITEMS: delay,
        GET_MULTIPLE_DEDUCTION_SETTINGS: delay,
        GET_MERCHANT_POINT_VALUE_SETTING_FOR_SELECT: delay,
      },
    })
    expect(editButton(cardOf('服務扣項方式命名'))).toBeDisabled()
    expect(editButton(cardOf('互助類別名稱設定'))).toBeDisabled()
    expect(cardOf('服務扣項方式命名').querySelector('.animate-pulse')).not.toBeNull()
    expect(cardOf('人員身分類別設定').querySelector('.animate-pulse')).not.toBeNull()
    expect(cardOf('互助類別名稱設定').querySelector('.animate-pulse')).not.toBeNull()
    expect(cardOf('抽成方式設定').querySelector('.animate-pulse')).not.toBeNull()
    expect(cardOf('互助點數設定').querySelector('.animate-pulse')).not.toBeNull()
    await utils.settle()
    expect(cardOf('抽成方式設定').querySelector('.animate-pulse')).toBeNull()
  })

  it('所有查詢失敗：各分頁不整頁錯誤', async () => {
    const utils = renderPage(<PerformanceDeductionParameter />, { fixtures: {}, fallback: 'error' })
    await utils.settle()
    for (const tab of ['服務扣項方式命名', '人員身分類別', '抽成方式設定', '互助點數設定']) {
      await openTab(tab)
      expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    }
    // 讀不到資料時不能編輯（存檔會以空白列整批取代後端資料）
    expect(editButton(cardOf('服務扣項方式命名'))).toBeDisabled()
    expect(editButton(cardOf('人員身分類別設定'))).toBeDisabled()
    expect(editButton(cardOf('互助類別名稱設定'))).toBeDisabled()
  })
})
