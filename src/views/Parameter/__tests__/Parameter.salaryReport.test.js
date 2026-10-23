// 保護：系統參數「薪資」與「報表」分頁。
// - 薪資加項／扣項科目：新增（排序號接續最後一列）、改名、刪除，只送非空白的科目；只剩一列時不能刪；讀取中不能新增刪除；
// - 薪資轉帳設定（匯款人、委託人資料）與「顯示未設定銀行帳號的員工」；
// - 薪資及月結設定的開關與薪資條列印間距；
// - 日報表設定、其他報表設定（含多店業績依據切換，再按一次已選項目不會清成空值）。
// GraphQL 由模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs, renderPage } from '../../../__tests__/testkit.test'
import Parameter from '..'
import { baseFixtures, renderParameter, openTab, save, sent, checkboxByLabel, controlByLabel, selectValue, typeText, cardOf } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('薪資分頁', () => {
  it('加項：新增（排序接續）、改名、刪除；扣項：新增後刪除；只送非空白科目', async () => {
    const utils = await renderParameter()
    await openTab('薪資')
    const inc = cardOf('薪資加項科目設定')
    const incInputs = () => screen.getAllByLabelText('薪資加項科目設定')
    expect(incInputs().map(i => i.value)).toEqual(['獎金', '全勤'])
    // 新增鈕只在最後一列
    expect(inc.querySelectorAll('svg.lucide-plus')).toHaveLength(1)
    fireEvent.click(inc.querySelector('svg.lucide-plus'))
    expect(inc).toHaveTextContent('3')
    await typeText(incInputs()[2], '交通')
    await typeText(incInputs()[0], '業績獎金')
    // 刪掉「全勤」
    fireEvent.click(inc.querySelectorAll('svg[class*="lucide-trash"]')[1])
    expect(incInputs().map(i => i.value)).toEqual(['業績獎金', '交通'])

    const dec = cardOf('薪資扣項科目設定')
    // 只有一列時沒有刪除鈕
    expect(dec.querySelectorAll('svg[class*="lucide-trash"]')).toHaveLength(0)
    fireEvent.click(dec.querySelector('svg.lucide-plus'))
    await typeText(screen.getAllByLabelText('薪資扣項科目設定')[1], '借支')
    fireEvent.click(dec.querySelectorAll('svg[class*="lucide-trash"]')[0])
    // 再新增一列空白（不會送出）
    fireEvent.click(dec.querySelector('svg.lucide-plus'))
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_SALARY_INCREASE_ITEM')).toEqual({
      input: [
        { itemSetting: '業績獎金', sorting: 1 },
        { itemSetting: '交通', sorting: 3 },
      ],
    })
    expect(sent(utils.calls, 'SET_MERCHANT_SALARY_DECREASE_ITEM')).toEqual({ input: [{ itemSetting: '借支', sorting: 2 }] })
  })

  it('讀取中不能新增或刪除科目', async () => {
    const utils = renderPage(<Parameter />, { fixtures: baseFixtures(), delays: { GET_MERCHANT_PASSWORD: 3000 } })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    await openTab('薪資')
    const inc = cardOf('薪資加項科目設定')
    fireEvent.click(inc.querySelector('svg.lucide-plus'))
    fireEvent.click(inc.querySelector('svg[class*="lucide-trash"]'))
    const dec = cardOf('薪資扣項科目設定')
    fireEvent.click(dec.querySelector('svg.lucide-plus'))
    expect(screen.getAllByLabelText('薪資加項科目設定')).toHaveLength(2)
    expect(screen.getAllByLabelText('薪資扣項科目設定')).toHaveLength(1)
    // 扣項有兩列時的刪除也無作用
    await utils.settle()
  })

  it('讀取中扣項的刪除鈕無作用', async () => {
    const utils = renderPage(<Parameter />, {
      fixtures: {
        ...baseFixtures(),
        GET_MERCHANT_SALARY_DECREASE_ITEMS: {
          getMerchantSalaryDecreaseItems: [
            { id: 'sd-1', itemSetting: '勞保', type: 'D', sorting: 1 },
            { id: 'sd-2', itemSetting: '健保', type: 'D', sorting: 2 },
          ],
        },
      },
      delays: { GET_MERCHANT_PASSWORD: 3000 },
    })
    await wait(() => expect(screen.getByRole('checkbox', { name: '指定互助人功能' })).toBeChecked())
    await openTab('薪資')
    await wait(() => expect(screen.getAllByLabelText('薪資扣項科目設定')).toHaveLength(2))
    fireEvent.click(cardOf('薪資扣項科目設定').querySelector('svg[class*="lucide-trash"]'))
    expect(screen.getAllByLabelText('薪資扣項科目設定')).toHaveLength(2)
    await utils.settle()
  })

  it('薪資轉帳設定：匯款人與委託人資料、顯示未設定銀行帳號的員工', async () => {
    const utils = await renderParameter()
    await openTab('薪資')
    expect(screen.getByLabelText('匯款人姓名')).toHaveValue('王小明')
    const values = {
      匯款人姓名: '李大華',
      匯款人銀行名稱: '第一銀行',
      匯款人帳號: '9998887776',
      匯款人銀行分行名稱: '信義分行',
      匯款人銀行分行代號: '0099',
      委託人名稱: '新店名',
      委託人電話: '0287654321',
    }
    for (const [label, value] of Object.entries(values)) {
      await typeText(screen.getByLabelText(label), value)
    }
    fireEvent.click(checkboxByLabel('薪資轉帳明細顯示未設定銀行帳號的員工'))
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_BANKS_SETTINGS')).toEqual({
      input: {
        remitterName: '李大華',
        remitterBankName: '第一銀行',
        remitterBankAccount: '9998887776',
        remitterBankBranchName: '信義分行',
        remitterBankBranchCode: '0099',
        trustorName: '新店名',
        trustorPhone: '0287654321',
      },
    })
    expect(sent(utils.calls, 'SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT')).toEqual({ input: true })
  })

  it('薪資及月結設定：開關切換與列印間距', async () => {
    const utils = await renderParameter()
    await openTab('薪資')
    fireEvent.click(checkboxByLabel('月結時自動結算加扣項設定'))
    fireEvent.click(checkboxByLabel('互助獲得自動帶入薪資加扣項'))
    fireEvent.click(checkboxByLabel('薪資表顯示出勤統計'))
    await selectValue(controlByLabel('薪資條列印間距'), '大')
    await save(utils)
    expect(sent(utils.calls, 'SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING').input).toMatchObject({
      isSalaryItemAutoSetWhileMonthlyCheckout: true,
      isHelperRetrieveAutoSetForMonthlyCheckout: false,
      isAttendanceStatisticsDisplayOnUserSalary: true,
      employeePayslipPrintStyle: 'LARGE',
      isEPWDDisplay: true,
    })
  })
})

describe('報表分頁', () => {
  it('日報表設定：開關切換與設計師名稱顯示', async () => {
    const utils = await renderParameter()
    await openTab('報表')
    fireEvent.click(checkboxByLabel('日報表顯示「金額」欄位'))
    fireEvent.click(checkboxByLabel('店家日報表非現金入金合併顯示'))
    await selectValue(controlByLabel('日報表設計師名稱顯示'), '代號')
    await save(utils)
    expect(sent(utils.calls, 'SET_PARAMETER_REPORT_SETTING').input).toMatchObject({
      isPriceDisplayOnDailyReport: false,
      isNoCashWalletGroupedInMDR: true,
      designerNameForReportType: 'NO',
    })
  })

  it('其他報表設定：開關切換；多店業績依據可切換，再按一次已選項目不會清成空值', async () => {
    const utils = await renderParameter()
    await openTab('報表')
    fireEvent.click(checkboxByLabel('報表匯出客資遮碼'))
    fireEvent.click(checkboxByLabel('顯示非現金表格'))
    const current = screen.getByRole('button', { name: '依當前店家' })
    fireEvent.click(current)
    expect(current).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(current)
    expect(current).toHaveAttribute('aria-pressed', 'true')
    await save(utils)
    expect(sent(utils.calls, 'SET_PARAMETER_REPORT_SETTING').input).toMatchObject({
      isCustomerDataMarked: false,
      nonCashDisplay: true,
      multiStorePerfRef: 'CURRENT',
    })
  })
})
