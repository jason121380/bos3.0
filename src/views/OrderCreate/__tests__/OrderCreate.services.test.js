// 保護打帳單「項目消費」（服務列）的櫃台操作與送出內容：
// - 可改價的服務改價後以新價格送出；鎖價（TRUE／UNSET）的服務價格欄停用
// - 服務設定了助理類別時列出助理欄（略過空類別），選的助理與「指定」勾選隨帳單送出
// - 第三方卡券：店家開啟時可選卡券，並顯示扣完手續費後的業績（百分比／固定金額）；服務綁定且鎖定的卡券不能改
// - 新增／清除／刪除列：帳單只送出仍有服務的列；從清單選擇服務帶入下一列
// - 鍵盤：服務欄、價格欄、助理欄、第三方卡券欄按 Enter 依序跳到下一個要填的欄位，最後跳到下一列服務
// GraphQL 全由模擬 link 回應，不建立真實帳單。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import {
  setupPage, waitPageReady, pickEmployee, pickService, checkoutButton, sentOrder, summaryValue,
  SERVICE, SERVICE_LOCKED, SERVICE_UNSET, HELPER, button, buttonsIn, currentDialog, findDialog,
} from './orderCreateKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

// 服務的助理設定：「助理」類別兩個名稱、一個空類別（不產生欄位）
const HELPER_SETTING = {
  service: {
    helperDeductionSetting: [
      { type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'PERCENT' },
      { type: '', nameList: ['不該出現'], helperDeductionType: 'PERCENT' },
    ],
  },
}
const ONE_HELPER = {
  service: { helperDeductionSetting: [{ type: '助理', nameList: ['洗髮'], helperDeductionType: 'CASH' }] },
}

const serviceInputs = () => screen.getAllByPlaceholderText('服務名稱/代號')
const priceInput = (row = 0) => document.querySelectorAll('input[name="price"]')[row]
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const thirdPartyInput = () => screen.getByPlaceholderText('第三方卡券')
const addFromList = (dialog, name) => fireEvent.click(button('加入', within(dialog).getByText(name).closest('tr')))

const prepare = async (overrides, options) => {
  const page = setupPage(overrides, options)
  await waitPageReady()
  await pickEmployee()
  fireEvent.click(screen.getByLabelText('不留客資'))
  return page
}
const checkout = async calls => {
  await wait(() => expect(checkoutButton()).not.toBeDisabled())
  fireEvent.click(checkoutButton())
  await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
  return sentOrder(calls)
}

describe('項目消費：價格', () => {
  it('可改價的服務：改價後彙總與送出都用新價格；清空價格視為 0', async () => {
    const { calls } = await prepare()
    await pickService()
    const price = priceInput()
    expect(price).not.toBeDisabled()
    fireEvent.change(price, { target: { value: '' } })
    await wait(() => expect(price).toHaveValue('0'))
    fireEvent.change(price, { target: { value: '650' } })
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('650'))
    expect((await checkout(calls)).serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id, price: 650 })])
  })

  it('鎖價（TRUE／UNSET）的服務：價格欄停用，以原價送出', async () => {
    const { calls } = await prepare()
    await pickService(SERVICE_LOCKED)
    expect(priceInput()).toBeDisabled()
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE_UNSET, 1)
    expect(priceInput(1)).toBeDisabled()
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders).toEqual([
      expect.objectContaining({ serviceId: SERVICE_LOCKED.id, price: 2000, thirdPartyCouponMerchantId: 'tp-1' }),
      expect.objectContaining({ serviceId: SERVICE_UNSET.id, price: 1200 }),
    ])
  })
})

describe('項目消費：助理', () => {
  it('服務設定了助理：列出各助理欄（略過空類別），選的助理隨帳單送出', async () => {
    const { calls } = await prepare({ service: HELPER_SETTING })
    await pickService()
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    expect(screen.getByPlaceholderText('助理-吹整')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/不該出現/)).toBeNull()
    await pickEmployee(wash, HELPER)
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders[0].serviceOrderHelpers).toEqual([
      expect.objectContaining({ type: '助理-洗髮', helperId: HELPER.userId, isDesignate: false, helperDeductiontype: 'PERCENT' }),
    ])
  })

  it('店家開啟助理指定：可勾選助理「指定」，隨帳單送出', async () => {
    const { calls } = await prepare({
      service: ONE_HELPER,
      GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
    })
    await pickService()
    await pickEmployee(await screen.findByPlaceholderText('助理-洗髮'), HELPER)
    fireEvent.click(screen.getByTestId('service-0_helper-employee-0-assign'))
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders[0].serviceOrderHelpers).toEqual([
      expect.objectContaining({ type: '助理-洗髮', helperId: HELPER.userId, isDesignate: true }),
    ])
  })

  it('清除此列：助理與服務一起清掉，帳單不再有服務', async () => {
    await prepare({ service: ONE_HELPER })
    await pickService()
    await pickEmployee(await screen.findByPlaceholderText('助理-洗髮'), HELPER)
    fireEvent.click(screen.getByTestId('service-0-clear'))
    await wait(() => expect(serviceInputs()[0]).toHaveValue(''))
    expect(screen.queryByPlaceholderText('助理-洗髮')).toBeNull()
    expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費')
    expect(serviceInputs()[0]).toHaveFocus()
  })
})

describe('項目消費：第三方卡券', () => {
  it('店家開啟第三方卡券：選百分比卡券顯示扣完手續費後業績，送出帶卡券；改選固定金額卡券依金額扣', async () => {
    const { calls } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService()
    fireEvent.click(thirdPartyInput())
    fireEvent.click(await screen.findByTestId('團購券'))
    // 800 × (100 − 10)% = 720
    expect(await screen.findByText('扣完後業績:720')).toBeInTheDocument()
    fireEvent.click(thirdPartyInput())
    fireEvent.click(await screen.findByTestId('禮券'))
    // 800 − 100 = 700
    expect(await screen.findByText('扣完後業績:700')).toBeInTheDocument()
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders[0].thirdPartyCouponMerchantId).toBe('tp-2')
  })

  it('清除選的第三方卡券：送出不帶卡券', async () => {
    const { calls } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService()
    fireEvent.click(thirdPartyInput())
    fireEvent.click(await screen.findByTestId('團購券'))
    await screen.findByText('扣完後業績:720')
    act(() => thirdPartyInput().focus())
    fireEvent.mouseDown(buttonsIn(thirdPartyInput().closest('.ui-root') || document.body, '清除')[0])
    await wait(() => expect(screen.queryByText(/扣完後業績/)).toBeNull())
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders[0].thirdPartyCouponMerchantId).toBeFalsy()
  })

  it('服務綁定且鎖定的卡券：即使店家沒開第三方卡券也顯示，但不能改', async () => {
    await prepare()
    await pickService(SERVICE_LOCKED)
    await wait(() => expect(thirdPartyInput()).toBeDisabled())
    expect(thirdPartyInput()).toHaveValue('團購券')
    // 2000 × 90% = 1800
    expect(screen.getByText('扣完後業績:1,800')).toBeInTheDocument()
  })

  it('綁定設定 UNSET：是否鎖定依店家「服務綁定第三方卡券鎖定」設定', async () => {
    await prepare({
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
      GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
        getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false },
      },
    })
    await pickService(SERVICE_UNSET)
    await wait(() => expect(thirdPartyInput()).toBeDisabled())
  })

  it('綁定設定 UNSET、店家設定比服務晚到：設定到了才套用鎖定', async () => {
    await prepare({
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
      GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: {
        getBindedThirdPartTicketLockedSetting: { service: true, product: false, membership: false },
      },
    }, { delays: { GET_BINDED_THIRD_PART_TICKET_LOCKED_SETTING: 3000 } })
    await pickService(SERVICE_UNSET)
    // 設定還沒到：先依預設（不鎖定）
    expect(thirdPartyInput()).not.toBeDisabled()
    await wait(() => expect(thirdPartyInput()).toBeDisabled(), { timeout: 5000 })
  })
})

describe('項目消費：列操作', () => {
  it('新增列、刪除列：帳單只送出剩下的服務', async () => {
    const { calls } = await prepare()
    await pickService()
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE_LOCKED, 1)
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('2,800'))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(serviceInputs()).toHaveLength(1))
    await wait(() => expect(summaryValue('服務消費')).toHaveTextContent('800'))
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders).toEqual([expect.objectContaining({ serviceId: SERVICE.id })])
  })

  it('改打字清掉已選的服務：該列不再算入帳單', async () => {
    await prepare()
    await pickService()
    fireEvent.change(serviceInputs()[0], { target: { value: '染' } })
    await wait(() => expect(screen.getByText(/尚缺/)).toHaveTextContent('至少一項消費'))
  })

  it('從清單選擇服務：第一列空白時帶入第一列，之後帶入新的一列', async () => {
    const { calls } = await prepare({ service: ONE_HELPER })
    fireEvent.click(button('從清單選擇服務'))
    const dialog = await findDialog()
    addFromList(dialog, SERVICE.name)
    await wait(() => expect(currentDialog()).toBeNull())
    await wait(() => expect(serviceInputs()[0]).toHaveValue(`${SERVICE.name}(${SERVICE.no})`))
    // 清單選的服務也帶出助理欄
    expect(await screen.findByPlaceholderText('助理-洗髮')).toBeInTheDocument()

    fireEvent.click(button('從清單選擇服務'))
    const dialog2 = await findDialog()
    addFromList(dialog2, SERVICE_LOCKED.name)
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders.map(d => d.serviceId)).toEqual([SERVICE.id, SERVICE_LOCKED.id])
  })

  it('從清單選擇服務：可依分類篩選、清除篩選，關閉後不帶入', async () => {
    const { calls } = await prepare()
    fireEvent.click(button('從清單選擇服務'))
    const dialog = await findDialog()
    fireEvent.click(within(dialog).getByText('剪髮'))
    await wait(() =>
      expect(callsOf(calls, 'GET_SERVICES_FOR_AUTOCOMPLETE').some(c => (c.variables.input.categoryIds || []).includes('cat-1'))).toBe(true)
    )
    expect(within(dialog).getByText('剪髮類服務')).toBeInTheDocument()
    fireEvent.click(button('清除', dialog))
    await wait(() => expect(callsOf(calls, 'GET_SERVICES_FOR_AUTOCOMPLETE').slice(-1)[0].variables.input.categoryIds).toEqual([]))
    fireEvent.click(buttonsIn(dialog, '關閉')[1])
    await wait(() => expect(currentDialog()).toBeNull())
    expect(serviceInputs()[0]).toHaveValue('')
  })
})

describe('項目消費：Enter 跳下一欄', () => {
  it('可改價服務：服務欄 Enter → 價格；價格 Enter（沒有助理、沒開卡券）→ 下一列服務', async () => {
    await prepare()
    await pickService()
    enter(serviceInputs()[0])
    await wait(() => expect(priceInput()).toHaveFocus())
    enter(priceInput())
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    await wait(() => expect(serviceInputs()[1]).toHaveFocus())
  })

  it('鎖價服務有助理：服務欄 Enter → 第一個助理；助理 Enter → 下一個助理 → 最後一個 Enter 到下一列', async () => {
    await prepare({ service: HELPER_SETTING })
    await pickService(SERVICE_UNSET)
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    enter(serviceInputs()[0])
    await wait(() => expect(wash).toHaveFocus())
    enter(wash)
    await wait(() => expect(screen.getByPlaceholderText('助理-吹整')).toHaveFocus())
    enter(screen.getByPlaceholderText('助理-吹整'))
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('鎖價服務沒有助理：服務欄 Enter → 下一列（沒開卡券）', async () => {
    await prepare()
    await pickService(SERVICE_UNSET)
    enter(serviceInputs()[0])
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('鎖價服務沒有助理、店家開卡券：服務欄 Enter → 第三方卡券；卡券 Enter → 下一列', async () => {
    await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService(SERVICE_UNSET)
    enter(serviceInputs()[0])
    await wait(() => expect(thirdPartyInput()).toHaveFocus())
    enter(thirdPartyInput())
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('價格欄 Enter：有助理 → 第一個助理；店家開卡券（沒有助理）→ 卡券', async () => {
    await prepare({ service: ONE_HELPER, GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService()
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    enter(priceInput())
    await wait(() => expect(wash).toHaveFocus())
    // 助理（最後一個）Enter、開卡券 → 卡券
    enter(wash)
    await wait(() => expect(thirdPartyInput()).toHaveFocus())
  })

  it('價格欄 Enter：沒有助理、店家開卡券 → 卡券；服務綁定鎖定卡券 → 直接下一列', async () => {
    const { settle } = await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService()
    // 等服務的助理設定查回來（查詢中按 Enter 不動作）
    await settle()
    enter(priceInput())
    await wait(() => expect(thirdPartyInput()).toHaveFocus())
    // 第二列：綁定且鎖定卡券的服務（價格欄停用，以鍵盤事件模擬）
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE_LOCKED, 1)
    await wait(() => expect(screen.getAllByPlaceholderText('第三方卡券')[1]).toBeDisabled())
    await settle()
    enter(priceInput(1))
    await wait(() => expect(serviceInputs()).toHaveLength(3))
  })

  it('開助理指定：助理 Enter → 指定勾選；指定 Enter → 下一個助理 → 最後一個指定 Enter 到下一列', async () => {
    await prepare({ service: HELPER_SETTING, GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true } })
    await pickService()
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    const assign0 = screen.getByTestId('service-0_helper-employee-0-assign')
    enter(wash)
    await wait(() => expect(assign0).toHaveFocus())
    enter(assign0)
    await wait(() => expect(screen.getByPlaceholderText('助理-吹整')).toHaveFocus())
    const assign1 = screen.getByTestId('service-0_helper-employee-1-assign')
    enter(assign1)
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('開助理指定與卡券：最後一個助理 Enter → 指定；最後一個指定 Enter → 卡券', async () => {
    await prepare({
      service: ONE_HELPER,
      GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await pickService()
    await screen.findByPlaceholderText('助理-洗髮')
    const assign0 = screen.getByTestId('service-0_helper-employee-0-assign')
    enter(assign0)
    await wait(() => expect(thirdPartyInput()).toHaveFocus())
  })

  it('服務綁定鎖定卡券、開卡券：最後一個助理（或指定）Enter → 直接下一列', async () => {
    await prepare({ service: ONE_HELPER, GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService(SERVICE_LOCKED)
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    await wait(() => expect(thirdPartyInput()).toBeDisabled())
    enter(wash)
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('服務綁定鎖定卡券、開助理指定與卡券：最後一個指定 Enter → 直接下一列', async () => {
    await prepare({
      service: ONE_HELPER,
      GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true },
      GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true },
    })
    await pickService(SERVICE_LOCKED)
    await screen.findByPlaceholderText('助理-洗髮')
    await wait(() => expect(thirdPartyInput()).toBeDisabled())
    enter(screen.getByTestId('service-0_helper-employee-0-assign'))
    await wait(() => expect(serviceInputs()).toHaveLength(2))
  })

  it('非 Enter 按鍵不移動焦點', async () => {
    await prepare({ service: ONE_HELPER, GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: true } })
    await pickService()
    const wash = await screen.findByPlaceholderText('助理-洗髮')
    const assign0 = screen.getByTestId('service-0_helper-employee-0-assign')
    act(() => wash.focus())
    fireEvent.keyDown(wash, { key: 'a', keyCode: 65 })
    fireEvent.keyDown(assign0, { key: 'a', keyCode: 65 })
    fireEvent.keyDown(priceInput(), { key: 'a', keyCode: 65 })
    fireEvent.keyDown(serviceInputs()[0], { key: 'a', keyCode: 65 })
    expect(serviceInputs()).toHaveLength(1)
  })
})

describe('項目消費：多列與清單', () => {
  it('刪除／清除其中一列：其他列的服務與助理照樣送出', async () => {
    const { calls } = await prepare({ service: ONE_HELPER })
    await pickService()
    await pickEmployee(await screen.findByPlaceholderText('助理-洗髮'), HELPER)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE_LOCKED, 1)
    fireEvent.click(screen.getByTestId('service-1-add'))
    await wait(() => expect(serviceInputs()).toHaveLength(3))
    // 刪掉空白的第三列、清除第二列
    fireEvent.click(screen.getByTestId('service-2-delete'))
    await wait(() => expect(serviceInputs()).toHaveLength(2))
    fireEvent.click(screen.getByTestId('service-1-clear'))
    await wait(() => expect(serviceInputs()[1]).toHaveValue(''))
    const { serviceOrders } = await checkout(calls)
    expect(serviceOrders).toEqual([
      expect.objectContaining({
        serviceId: SERVICE.id,
        serviceOrderHelpers: [expect.objectContaining({ helperId: HELPER.userId })],
      }),
    ])
  })

  it('多列時在某一列按 Enter：焦點落在該列的價格，不會被其他鎖價列搶走', async () => {
    await prepare({ service: ONE_HELPER })
    // 第一列：鎖價且有助理；第二列：可改價
    await pickService(SERVICE_LOCKED)
    await screen.findByPlaceholderText('助理-洗髮')
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE, 1)
    enter(serviceInputs()[1])
    await wait(() => expect(priceInput(1)).toHaveFocus())
  })

  it('多列時有鎖價且沒有助理的列：在其他列按 Enter 焦點仍落在該列價格', async () => {
    const { settle } = await prepare()
    await pickService(SERVICE_LOCKED)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await pickService(SERVICE, 1)
    await settle()
    enter(serviceInputs()[1])
    await wait(() => expect(priceInput(1)).toHaveFocus())
  })

  it('第三方卡券欄非 Enter 按鍵不跳列', async () => {
    await prepare({ GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: true } })
    await pickService()
    fireEvent.keyDown(thirdPartyInput(), { key: 'a', keyCode: 65 })
    expect(serviceInputs()).toHaveLength(1)
  })

  it('收合時標題顯示已填筆數與金額', async () => {
    await prepare()
    await pickService()
    fireEvent.click(screen.getByTestId('panelService'))
    expect(await screen.findByText('已填 1 筆 · 800')).toBeInTheDocument()
  })

  it('服務清單還在載入時按「從清單選擇服務」不開啟', async () => {
    await prepare({}, { delays: { GET_SERVICES_FOR_AUTOCOMPLETE: 600 } })
    fireEvent.click(button('從清單選擇服務'))
    expect(currentDialog()).toBeNull()
  })

  it('從清單選擇服務：可換每頁筆數與頁數（查詢帶分頁條件）；略過沒有類別的助理設定', async () => {
    const { calls } = await prepare({
      GET_SERVICES_FOR_AUTOCOMPLETE: { services: { totalCount: 120, pageOffset: 0, pageLimit: 50, data: [SERVICE, SERVICE_LOCKED, SERVICE_UNSET] } },
      service: HELPER_SETTING,
    })
    fireEvent.click(button('從清單選擇服務'))
    const picker = await findDialog()
    // 每頁筆數（表格下方唯一的下拉選單）
    const perPage = picker.querySelector('select')
    const ten = [...perPage.options].find(o => o.textContent === '10')
    fireEvent.change(perPage, { target: { value: ten.value } })
    await wait(() => expect(callsOf(calls, 'GET_SERVICES_FOR_AUTOCOMPLETE').some(c => c.variables.input.pageLimit === 10)).toBe(true))
    fireEvent.click(within(picker).getByLabelText('下一頁'))
    await wait(() => expect(callsOf(calls, 'GET_SERVICES_FOR_AUTOCOMPLETE').some(c => c.variables.input.pageOffset === 1)).toBe(true))
    addFromList(picker, SERVICE.name)
    expect(await screen.findByPlaceholderText('助理-洗髮')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/不該出現/)).toBeNull()
  })
})
