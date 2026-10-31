// 系統參數設定頁測試共用的假資料與操作（本身也是測試檔：CRA 把 __tests__ 下每個檔都當測試，直接執行時驗證工具本身；
// 被其他測試 import 時只提供函式）。
// 為什麼需要：參數頁一次發出 33 支設定查詢、存檔一次送出 29 支 mutation；這裡集中一份「店家目前的設定」假資料、
// 帶正式環境設定快取（settings-cache）的渲染、以標籤找欄位與切換分頁的操作，讓各分頁的測試只寫與業務有關的部分。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實資料。
import React from 'react'
import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { act, fireEvent, render, screen, wait } from '@testing-library/react'
import PageErrorBoundary from 'components/PageErrorBoundary'
import { settingsCacheLink, bindSettingsCache } from 'lib/settings-cache'
import { createAutoMockLink, createTestStore, blockNetwork, renderPage, callsOf, typeLikeBrowser } from '../../../__tests__/testkit.test'
import Parameter from '..'

const isMain = expect.getState().testPath === __filename

const flags = (customer, designer, merchant) => ({ customer, designer, merchant })
const pw = (password, isUsing) => ({ password, isUsing })

// 店家目前的設定（後端回應）：各欄位刻意給非預設值，才看得出「讀進畫面、原樣送回」
export const baseFixtures = () => ({
  MERCHANT_DEDUCTION_ITEMS: { merchantDeductionItems: [{ type: 'A', name: '扣項甲' }] },
  GET_MERCHANT_SALARY_INCREASE_ITEMS: {
    getMerchantSalaryIncreaseItems: [
      { id: 'si-2', itemSetting: '全勤', type: 'INCREASE', sorting: 2 },
      { id: 'si-1', itemSetting: '獎金', type: 'INCREASE', sorting: 1 },
    ],
  },
  GET_MERCHANT_SALARY_DECREASE_ITEMS: {
    getMerchantSalaryDecreaseItems: [{ id: 'sd-1', itemSetting: '勞保', type: 'DECREASE', sorting: 1 }],
  },
  GET_MERCHANT_PASSWORD: {
    merchantPassword: {
      superPassword: 'super-1',
      reCheckoutOrder: pw('re-1', true),
      deleteOrder: pw('del-1', false),
      restoreCheckout: pw('rc-1', false),
      deleteProduct: pw('dp-1', false),
      deleteCustomer: pw('dc-1', false),
      deleteService: pw('ds-1', true),
      editMoneyFlow: pw('em-1', false),
      purchaseStockIn: pw('ps-1', false),
      purchaseStockInUndo: pw('pu-1', false),
      cancelReservation: pw('cr-1', false),
    },
  },
  GET_MERCHANT_FAKE_PERFORMANCE_REFER: { getMerchantFakePerformanceReference: 'CASH' },
  GET_MERCHANT_BANK_SETTINGS: {
    getMerchantBankSettings: {
      remitterName: '王小明',
      remitterBankName: '台灣銀行',
      remitterBankAccount: '0001112223',
      remitterBankBranchName: '城中分行',
      remitterBankBranchCode: '0011',
      trustorName: '測試店',
      trustorPhone: '0223456789',
    },
  },
  GET_IS_LOCK_DATE: { getIsDateLock: true },
  GET_MERCHANT_CLOCK_IN_SETTING: {
    getMerchantClockInSetting: [
      {
        name: '早班',
        clockInHour: 9,
        clockInMinute: 5,
        isClockInUsing: true,
        clockOutHour: 18,
        clockOutMinute: 30,
        isClockOutUsing: true,
        breakTimeSetting: [{ startHour: 12, startMinute: 0, isStartTimeUsing: true, endHour: 13, endMinute: 0, isEndTimeHourUsing: false }],
        allowedDelayMinutes: 10,
        color: '#f44336',
        isWorkOverMinutesCalculated: false,
        isClockOutBufferMinutesUsing: true,
        clockOutBufferMinutes: 15,
      },
    ],
  },
  GET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT: { getIsDisplayNonBankAccountInBankTransferReport: false },
  GET_MERCHANT_BOOKINNG_NOTIFICATION_SETTING: {
    getMerchantBookingNotificationSetting: {
      customerCreateBooking: flags(true, false, true),
      customerCancelBooking: flags(false, false, false),
      designerCreateBooking: flags(false, true, false),
      designerCancelBooking: flags(false, false, false),
      bookingUpdated: flags(true, true, true),
    },
  },
  GetBookingLineNotifySettings: {
    getBookingLineNotifySettings: {
      cusCreateBooking: { customer: ['NODESIGNER'], designer: [], merchant: ['NODESIGNER', 'HASDESIGNER'] },
      cusCancelBooking: { customer: [], designer: [], merchant: [] },
      designerCreateBooking: { customer: [], designer: ['HASDESIGNER'], merchant: [] },
      designerCancelBooking: { customer: [], designer: [], merchant: [] },
      bookingUpdated: { customer: [], designer: [], merchant: [] },
    },
  },
  GET_PARAMETER_REPORT_SETTING: {
    getParameterReportSetting: {
      isPriceDisplayOnDailyReport: true,
      isOptimizationPrintModeOn: false,
      isServiceNameDisplayByCategory: false,
      isDisplayHelperRetrieveInDailyReport: false,
      isZeroValueHiddenOnDailyReport: false,
      isHelperPointPriceDisplay: false,
      isUsingMathRoundInDesignerDailyReport: false,
      isNoCashWalletGroupedInMDR: false,
      designerNameForReportType: 'NICKNAME',
      isDesignerSalaryDisplayOnBalanceReport: false,
      isCustomerDataMarked: true,
      isMonthlyAverageDisplayForDesignerLeaderBoard: false,
      isMonthlyAverageDisplayForMerchantLeaderBoard: false,
      isProductCostDisplay: false,
      isServiceTicketMerged: false,
      isOpenDateRangeInOrderMangement: false,
      isDisplayTogglePerformanceButton: false,
      CARPTDisplay: false,
      isDRROCDisplay: false,
      isDRRPEVDisplay: false,
      isEDCIFilterDisplay: false,
      isMultiStoreStaffPerfMergedHL: false,
      isMultiStoreStaffPerfMergedDL: false,
      multiStorePerfRef: 'EACH',
      isTSNoOT: false,
      nonCashDisplay: false,
    },
  },
  GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING: {
    getParameterCheckoutAndSalaryItemsSetting: {
      isSalaryItemAutoSetWhileMonthlyCheckout: false,
      isHelperRetrieveAutoSetForMonthlyCheckout: true,
      isDisplayFakePerformanceInSalaryReport: false,
      isBorrowDisplayInSalaryOverview: false,
      isPrintDetailDisplayOnSalaryReport: true,
      isEPWDDisplay: true,
      isPayslipOptimizationPrintModeOn: false,
      employeePayslipPrintStyle: 'MEDIUM',
      isAttendanceStatisticsDisplayOnUserSalary: false,
      isPrintDateHiddenForPayslip: false,
    },
  },
  GET_MERCHANT_EXTERNAL_LINK: {
    merchantExternalLink: [
      { id: 'el-1', name: '教育訓練', url: 'https://a.example', userAuth: [{ id: 'auth-1', authorityName: '店長' }] },
      { id: 'el-2', name: '公告', url: 'https://b.example', userAuth: [] },
    ],
  },
  GET_MERCHANT_REVERVATION_TIME: {
    getMerchantReservationTime: [{ title: '平日', useDay: ['MON', 'TUE'], openingHours: '10:00:00', closingHours: '20:30:00' }],
  },
  GET_MERCHANT_HAIR_CONDITION: {
    getMerchantHairCondition: {
      hairProperties: ['細軟'],
      scalpProperties: [],
      permAppliance: [],
      permPotion: [],
      hairColorCategory: [],
      hairColor: [],
    },
  },
  GET_LINE_CONNECTED_USER: {
    getLineConnectedUser: [
      { id: 'u-1', name: '設計師甲' },
      { id: 'u-2', name: '設計師乙' },
      { id: 'u-3', name: '設計師丙' },
    ],
  },
  GET_NONDESIGNATE_BOOKING_RECIOIENTS: {
    nonDesignateBookingRecipients: [
      { id: 'u-2', name: '設計師乙' },
      { id: 'u-9', name: '已解除綁定' },
    ],
  },
  GET_PARAMETER_ORDER_CREATE_SETTING: {
    getParameterOrderCreateSetting: {
      isHelperDesignationDisplay: true,
      isThirdPartTicketDisplay: false,
      isDateLockDisplay: false,
      isDetailBottomed: false,
      orderWithoutCustomerDefault: false,
      isQuickOrderModeOn: false,
      isAbleToChangeDateTimeInOrderCreate: false,
      isAutoSetPreferDesigner: false,
      isTicketSellSubItem: false,
      printFormat: '感熱紙(80mm)',
      designerNameDisplayOnInvoice: 'NAME',
      isServiceLocked: 'FALSE',
      isProductLocked: 'TRUE',
      isTicketLocked: 'FALSE',
      designationSettingForOrderCreate: 'DESIGNATE',
      isServiceBindedThirdPartTicketLocked: false,
      isPrintWindowClosureDelayed: false,
      isOrderSerialNumberUsing: false,
      isLBCusDisplay: true,
      isCusWalletUsageForOrder: true,
      logoDisplayOnInvoice: { isDisplay: true, imageUrl: null },
      messageDisplayOnInvoice: { isDisplay: false, message: '謝謝光臨' },
      qrcodeDisplayOnInvoice: { isDisplay: false, url: null, imageUrl: null },
    },
  },
  MerchantCusExternalLink: {
    merchantCusExternalLink: [
      { id: 'cl-1', name: '官網', url: 'https://shop.example', isTop: true },
      { id: 'cl-2', name: '粉專', url: 'https://fb.example', isTop: false },
    ],
  },
  GET_PARAMETER_ABOUT_SETTING_FUNCTION: {
    getParameterAboutSettingFunction: {
      isMemberShipCardActive: true,
      isCustomerBonusActive: false,
      isComboUsing: false,
      isAutoClearAddedTimeInScheduleTable: false,
      isMerchantScheduleDisplay: false,
      isPriceDisplayOnCustomerSide: false,
      isDailyCheckoutBlockedByDraftOrder: false,
      isEmployeeScheduleWorkingHourDisplay: true,
      isReportListExtended: true,
      isEmployeeScheduleUndoActive: true,
      isCustomerSelfCreateActive: false,
      designerNameForCustomerSide: 'BOTH',
      actionsBannedAfterDailyCheckout: ['PICKING'],
      isBookingTimeNoLimit: false,
      isBonusConversion: false,
      bonusConversionRate: 0,
      isEventDisplayOnDayBookingRecord: false,
      isWalletFinNonNeg: false,
      isBonusRewardWithLine: false,
      isUnlimProdEmpPrice: false,
      disablePendingOrder: false,
      openingTimeForDisplay: { openingHoursForDisplay: '09:00:00', closingHoursForDisplay: '21:00:00' },
      bonusRewardRule: { isUsing: false, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } },
    },
  },
  GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '路過'] },
  GET_MERCHANT_AVATAR: { getMerchantAvatar: null },
  GET_MERCHANT_RAKE_REFERENCE: { getMerchantRakeReference: { designate: 'FAKE', nonDesignate: 'TRUTH' } },
  GET_PARAMETER_ABOUT_BOOKING_SETTING: {
    getParameterAboutBookingSetting: {
      nonDesignationOrderLimit: 2,
      designationOrderLimit: 3,
      isBookingAutoAccept: false,
      isNDBNeedVerify: false,
      isCustomerBookedableInSameDay: true,
      isRTCUsing: false,
      isBookingRemarkDisplay: false,
      isCusBookingRemarkDisplay: true,
      isBirthdayIconDisplay: false,
      bookingLimitPerCellphoneInSameDay: null,
      disableBookingDayLimit: 1,
      createBookingDayLimit: 30,
      cancelBookingDayLimitByActionDate: null,
      cancelBookingDayLimitByServiceDate: 2,
      bookingTimeSetting: { openingHours: '10:00:00', closingHours: '22:30:00' },
      troubleShooting: '請來電',
      SMSAccount: { account: 'sms-acc', password: null },
      bookingNotificationPhone: [],
      bookingNotificationLine: { isUsing: false, notifyDayCount: 1 },
      inviteRatingDayCount: null,
      cusRatingDayLimit: null,
      isBookingHistoryDisplay: false,
      isDynamicBookingLimitUsing: false,
      cusMaxBookingCount: 5,
      isNDBInLimitCount: false,
    },
  },
  GET_PARAMETER_ABOUT_CUSTOMER_SETTING: {
    getParameterAboutCustomerSetting: {
      customerSidePageDisplay: { ServiceRecord: true, TicketRecord: true, WalletRecord: false, BonusRecord: false, CustomerMall: false },
      isCustomerProfileSync: false,
      isArrowDisplayForLine: false,
      isNRCDisplayForNewCus: false,
      requiredColumnForNewCustomer: ['EMAIL', 'BIRTHDAY'],
      isRemarkRequired: true,
      isCusBookingPreferDesOnly: false,
      isCusNonDesBookingUsing: true,
      isBookingItemRequired: false,
      closeCustomerBooking: false,
      isBookingPeerDisplay: true,
      isBookingItemPriceDisplay: true,
      bookingMinumnTimeCost: 2,
    },
  },
  GET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT: { getSpecificBookingNotificationDayCount: 3 },
  GET_DISABLE_BOOKING_DAY_LIMIT: { getDisableBookingDayLimit: 7 },
  GET_MERCHANT_CHECKIN_SETTING: {
    getMerchantCheckinSettings: {
      isBookingCheckinEnabled: false,
      isDoneBookingAutoNotify: false,
      isUnDoneBookingAutoNotify: false,
      isUnDoneBookingManualNotify: false,
    },
  },
  GET_IS_BOOKING_CUS_CHECK_USING: { getIsBookingCusCheckUsing: false },
  GET_IS_BOOKING_TYPE_FOR_SOCKET: { getBookingTypeForSocket: ['RESERVATION'] },
  GET_UES_USEING_SETTING: { getUESUsingSetting: false },
  GET_IS_CBRD_STYLIST: { getIsCBRDStylist: true },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      { id: 'auth-1', authorityName: '店長' },
      { id: 'auth-2', authorityName: '設計師' },
    ],
  },
})

// 存檔送出的 29 支 mutation
export const SAVE_MUTATIONS = [
  'SEIING_DEDUCTION_ITEMS',
  'SET_MERCHANT_SALARY_INCREASE_ITEM',
  'SET_MERCHANT_SALARY_DECREASE_ITEM',
  'SET_MERCHANT_PASSWORD',
  'SET_MERCHANT_FAKE_PERFORMANCE_REFER',
  'SET_MERCHANT_BANKS_SETTINGS',
  'SET_LOCK_DATE',
  'SET_MERCHANT_CLOCK_IN_SETTING',
  'SET_IS_DISPLAY_NON_BANK_ACCOUNT_IN_BANK_TRANSFER_REPORT',
  'SET_MERCHANT_BOOKING_NOTIFICATION_SETTING',
  'SetBookingLineNotifySettings',
  'SET_PARAMETER_REPORT_SETTING',
  'SET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING',
  'SET_MERCHANT_REVERVATION_TIME',
  'SET_MERCHANT_HAIR_CONDITION',
  'SET_NONDESIGNATE_BOOKING_RECIOIENTS',
  'SET_PARAMETER_ORDER_CREATE_SETTING',
  'SET_PARAMETER_ABOUT_SETTING_FUNCTION',
  'SET_CUSTOMER_REFERENCE',
  'SET_MERCHANT_RAKE_REFERENCE',
  'SET_PARAMETER_ABOUT_BOOKING_SETTING',
  'SET_SPECIFIC_BOOKING_NOTIFICATION_DAY_COUNT',
  'SET_DISABLE_BOOKING_DAY_LIMIT',
  'SET_MERCHANT_CHECKIN_SETTING',
  'SET_PARAMETER_ABOUT_CUSTOMER_SETTING',
  'SET_IS_BOOKING_CUS_CHECK_USING',
  'SET_IS_BOOKING_TYPE_FOR_SOCKET',
  'SET_UES_USEING_SETTING',
  'SET_IS_CBRD_STYLIST',
]

// 以 renderPage（一般 Apollo 快取）渲染參數頁並等所有查詢回來
export async function renderParameter({ fixtures = {}, ...options } = {}) {
  const utils = renderPage(<Parameter />, { fixtures: { ...baseFixtures(), ...fixtures }, route: '/parameter', ...options })
  await utils.settle()
  return utils
}

// 與 renderPage 相同的外層，但 link 前面接正式環境的 settingsCacheLink、並綁定這次的 cache：
// 用來驗證「存檔（mutation 成功）後設定類查詢被清除並重抓、操作密碼查詢不在設定快取內」
export function renderWithSettingsCache(ui, { fixtures = {} } = {}) {
  const calls = []
  blockNetwork()
  const mockLink = createAutoMockLink(fixtures, { calls })
  const cache = new InMemoryCache({ addTypename: false })
  bindSettingsCache(cache, { expire: false })
  const utils = render(
    <Provider store={createTestStore()}>
      <MockedProvider link={settingsCacheLink.concat(mockLink)} cache={cache} addTypename={false}>
        <MemoryRouter initialEntries={['/parameter']}>
          <PageErrorBoundary resetKey="test">{ui}</PageErrorBoundary>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  )
  const settle = async () => {
    let last = -1
    await wait(() => {
      const stable = mockLink.pending === 0 && calls.length === last
      last = calls.length
      if (!stable) throw new Error('查詢尚未全部回應')
    })
  }
  return { ...utils, calls, cache, settle }
}

// 切換左側分頁（Radix 分頁在 mousedown 時切換；activationMode="manual" 也接受 click）
export async function openTab(label) {
  const tab = screen.getByRole('tab', { name: label })
  fireEvent.mouseDown(tab, { button: 0 })
  await wait(() => expect(tab).toHaveAttribute('aria-selected', 'true'))
}

// 按「儲存」並等所有 mutation 都送出、回應
export async function save(utils) {
  fireEvent.click(screen.getByTestId('parameter'))
  await wait(() => expect(callsOf(utils.calls, 'SET_IS_CBRD_STYLIST').length).toBeGreaterThan(0))
  await utils.settle()
}

// 某支 mutation 最後一次送出的 variables
export const sent = (calls, operationName) => {
  const list = callsOf(calls, operationName)
  if (!list.length) throw new Error(`沒有送出 ${operationName}`)
  return list[list.length - 1].variables
}

// 勾選框（CheckboxField／FormControlLabel：label 內含 input）
export function checkboxByLabel(labelText, root = document.body, index = 0) {
  const labels = [...root.querySelectorAll('label')].filter(
    l => l.textContent.trim() === labelText.trim() && l.querySelector('input[type="checkbox"]')
  )
  if (!labels[index]) throw new Error(`找不到勾選框「${labelText}」(#${index})`)
  return labels[index].querySelector('input[type="checkbox"]')
}

// 以欄位標籤找控制項：有 htmlFor 且找得到元素就用它，否則取標籤所在外框內的第一個輸入元件
export function controlsByLabel(labelText, root = document.body) {
  const labels = [...root.querySelectorAll('label')].filter(label => {
    const own = [...label.childNodes]
      .filter(n => n.nodeType === 3 || (n.nodeType === 1 && n.tagName !== 'INPUT'))
      .map(n => n.textContent)
      .join('')
      .replace(/\s*\*$/, '')
      .trim()
    return own === labelText
  })
  return labels.map(label => {
    const byFor = label.htmlFor && root.ownerDocument.getElementById(label.htmlFor)
    if (byFor && /INPUT|SELECT|TEXTAREA/.test(byFor.tagName)) return byFor
    return label.parentElement.querySelector('input, select, textarea')
  })
}
export function controlByLabel(labelText, root = document.body, index = 0) {
  const found = controlsByLabel(labelText, root)[index]
  if (!found) throw new Error(`找不到欄位「${labelText}」(#${index})`)
  return found
}

// 卡片區塊：標題（CardTitle h3）所在的卡片（Card 外框；同名標題取第 index 個）
export function cardOf(title, root = document.body, index = 0) {
  const heading = [...root.querySelectorAll('h3')].filter(h => h.textContent === title)[index]
  if (!heading) throw new Error(`找不到區塊「${title}」`)
  return heading.closest('.rounded-2xl')
}

// 與瀏覽器相同的輸入（不包 act，updater 內讀 event.target 的欄位也拿得到新值），之後讓 effect 跑完
export async function typeText(input, value) {
  typeLikeBrowser(input, String(value))
  await act(async () => {})
}

// 下拉選單（ui/native-select：option 的 value 是索引，onChange 拿回原始值）依顯示文字選取
export async function selectValue(select, text) {
  const option = [...select.options].find(o => o.textContent === String(text))
  if (!option) throw new Error(`下拉沒有選項「${text}」：${[...select.options].map(o => o.textContent).join('、')}`)
  fireEvent.change(select, { target: { value: option.value } })
  await act(async () => {})
}
// 目前選取的選項文字
export const selectedText = select => (select.selectedIndex >= 0 ? select.options[select.selectedIndex].textContent : '')

if (isMain) {
  describe('parameterKit：以標籤找欄位、選下拉', () => {
    it('controlByLabel／checkboxByLabel／selectValue／typeText', async () => {
      const onSelect = jest.fn()
      const Demo = () => {
        const [text, setText] = React.useState('a')
        return (
          <div>
            <div>
              <label>名稱</label>
              <input value={text} onChange={e => setText(e.target.value)} />
            </div>
            <label htmlFor="sel">類別</label>
            <select id="sel" defaultValue="0" onChange={e => onSelect(e.target.value)}>
              <option value="0">甲</option>
              <option value="1">乙</option>
            </select>
            <label>
              <input type="checkbox" />
              <span>啟用</span>
            </label>
          </div>
        )
      }
      const { unmount } = render(<Demo />)
      await typeText(controlByLabel('名稱'), 'b')
      expect(controlByLabel('名稱').value).toBe('b')
      await selectValue(controlByLabel('類別'), '乙')
      expect(onSelect).toHaveBeenCalledWith('1')
      expect(selectedText(controlByLabel('類別'))).toBe('乙')
      await expect(selectValue(controlByLabel('類別'), '丙')).rejects.toThrow('下拉沒有選項')
      expect(checkboxByLabel('啟用').type).toBe('checkbox')
      expect(() => controlByLabel('不存在')).toThrow('找不到欄位')
      expect(() => checkboxByLabel('不存在')).toThrow('找不到勾選框')
      expect(() => sent([], 'X')).toThrow('沒有送出 X')
      expect(() => cardOf('不存在')).toThrow('找不到區塊')
      unmount()
    })
  })
}
