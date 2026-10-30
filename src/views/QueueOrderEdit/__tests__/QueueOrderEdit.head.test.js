// 保護「重新開單」頁首（帳單日期、顧客、不留客資、服務人員、指定方式）：
// - 顧客：可從清單選顧客、直接輸入手機（新顧客）、清除；輸入完整手機後馬上按 Enter（清單還沒回來）時，清單回來後自動帶入該顧客；
//   勾「不留客資」時移除顧客、扣入金與紅利歸 0，取消勾選後恢復可選顧客。
// - 帳單日期：選定的日期時間即重試送出的日期；打字打到一半（無效日期）時不改帳單日期。
// - 服務人員與指定方式：重試送出所選的服務人員與指定／不指定；鍵盤 Enter／左右鍵的操作順序（服務人員 → 指定方式 → 服務項目）。
// - 顧客資料：LINE 綁定圖示（店家開啟顯示時）、顧客的會員卡清單。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { setupQueue, loaded, baseQueue, retry, summaryValue, pickOption, inputOf, ASSISTANT, CUSTOMER, OTHER_CUSTOMER, DATE } from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const designerInput = () => screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
const withoutCustomer = () => screen.getByText('不留客資', { selector: 'label, label *' }).closest('label').querySelector('input')
// 佇列帳單：留客資但還沒選顧客
const noCustomerYet = (overrides = {}) => baseQueue({ withoutCustomerData: false, ...overrides })
const withCustomer = (overrides = {}) => baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false, ...overrides })
const customerDetail = (customer, extra = {}) => ({ customer: { ...customer, membershipPurchaseRecord: [], isLineBinded: false, ...extra } })

describe('重新開單：選顧客', () => {
  it('從清單選另一位顧客：帶入顧客、焦點移到服務人員；重試送出該顧客', async () => {
    const page = setupQueue({
      queue: noCustomerYet(),
      FETCH_CUSTOMER_DETAIL: ({ id }) => (id === OTHER_CUSTOMER.id ? customerDetail(OTHER_CUSTOMER) : { customer: null }),
    })
    await loaded(page)
    // 還沒選顧客：「重試」停用並說明缺顧客
    expect(screen.getByRole('status')).toHaveTextContent('顧客（或勾選「不留客資」）')
    await pickOption(customerInput(), '林先生/0922333444/C02')
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMER_DETAIL').pop().variables).toEqual({ id: OTHER_CUSTOMER.id }))
    const input = await retry(page.calls)
    expect(input.customerId).toBe(OTHER_CUSTOMER.id)
    expect(input.customerCellphone).toBe('')
  })

  it('直接輸入清單沒有的手機按 Enter：以手機建立新顧客送出，不帶顧客 id', async () => {
    const page = setupQueue({ queue: noCustomerYet() })
    await loaded(page)
    fireEvent.focusIn(customerInput())
    fireEvent.change(customerInput(), { target: { value: '0933000111' } })
    fireEvent.keyDown(customerInput(), { key: '0', keyCode: 48 })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    const input = await retry(page.calls)
    expect(input.customerCellphone).toBe('0933000111')
    expect(input.customerId).toBeUndefined()
  })

  it('選「新增 "手機"」選項：同樣以手機建立新顧客', async () => {
    const page = setupQueue({ queue: noCustomerYet() })
    await loaded(page)
    fireEvent.focusIn(customerInput())
    fireEvent.change(customerInput(), { target: { value: '0933000222' } })
    const option = await screen.findByText('新增 "0933000222"')
    fireEvent.click(option.closest('[role="option"]'))
    await wait(() => expect(customerInput()).toHaveValue('0933000222'))
    const input = await retry(page.calls)
    expect(input.customerCellphone).toBe('0933000222')
  })

  it('輸入完整手機後馬上按 Enter：顧客清單回來後自動帶入該顧客', async () => {
    const page = setupQueue({
      queue: noCustomerYet(),
      FETCH_CUSTOMER_DETAIL: ({ id }) => (id === OTHER_CUSTOMER.id ? customerDetail(OTHER_CUSTOMER) : { customer: null }),
    })
    await loaded(page)
    fireEvent.focusIn(customerInput())
    fireEvent.change(customerInput(), { target: { value: OTHER_CUSTOMER.cellphone } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    // 清單查詢延遲 800ms 才以新關鍵字送出
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').pop().variables.input.keyword).toBe(OTHER_CUSTOMER.cellphone), {
      timeout: 3000,
    })
    await wait(() => expect(customerInput()).toHaveValue('林先生/0922333444/C02'))
    const input = await retry(page.calls)
    expect(input.customerId).toBe(OTHER_CUSTOMER.id)
  })

  it('清除顧客：顧客移除，「重試」停用並改為「新增顧客」', async () => {
    const page = setupQueue({ queue: withCustomer() })
    await loaded(page)
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    fireEvent.focusIn(customerInput())
    fireEvent.mouseDown(customerInput().parentElement.querySelector('[aria-label="清除"]'))
    await wait(() => expect(customerInput()).toHaveValue(''))
    expect(screen.getByTestId('checkout')).toBeDisabled()
    // 清除後按鈕改為「新增顧客」
    expect(screen.getByRole('button', { name: '新增顧客' })).toBeInTheDocument()
  })

  it('顧客資料是「不留客資」的佔位顧客時，顧客欄不顯示它', async () => {
    const page = setupQueue({
      queue: withCustomer(),
      FETCH_CUSTOMER_DETAIL: customerDetail({ id: 'no-customer', no: '', name: '不留客資', cellphone: '' }),
    })
    await loaded(page)
    expect(customerInput()).toHaveValue('')
  })
})

describe('重新開單：不留客資', () => {
  it('勾選：移除顧客、扣入金與紅利歸 0，顧客欄停用；重試送出不留客資', async () => {
    const page = setupQueue({
      queue: withCustomer({ walletPay: 100, bonusDecount: 50 }),
      customerWallet: { customerWallet: 500 },
    })
    await loaded(page)
    expect(summaryValue('扣入金')).toHaveTextContent('100')
    fireEvent.click(withoutCustomer())
    await wait(() => expect(withoutCustomer()).toBeChecked())
    expect(summaryValue('扣入金')).toHaveTextContent(/^0$/)
    expect(customerInput()).toBeDisabled()
    expect(customerInput()).toHaveValue('')
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBe('true')
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ withoutCustomerData: true, walletPay: 0, bonusDecount: 0, bonusDeposit: 0, bonusUsed: 0 }))
    expect(input.customerId).toBeUndefined()
  })

  it('沒有顧客時勾選再取消：恢復可選顧客，「重試」要求選顧客', async () => {
    loginAs()
    localStorage.setItem('stayInCheckoutWithoutCustomer', true)
    const page = setupQueue({ queue: noCustomerYet() })
    await loaded(page)
    fireEvent.click(withoutCustomer())
    await wait(() => expect(withoutCustomer()).toBeChecked())
    expect(screen.getByTestId('checkout')).not.toBeDisabled()
    fireEvent.click(withoutCustomer())
    await wait(() => expect(withoutCustomer()).not.toBeChecked())
    expect(customerInput()).not.toBeDisabled()
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('顧客（或勾選「不留客資」）')
  })
})

describe('重新開單：顧客標示', () => {
  it('店家開啟 LINE 顯示且顧客已綁定：顯示 LINE 圖示；顧客有會員卡時可開會員卡清單', async () => {
    const page = setupQueue({
      queue: withCustomer(),
      GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: true } },
      FETCH_CUSTOMER_DETAIL: customerDetail(CUSTOMER, {
        isLineBinded: true,
        membershipPurchaseRecord: [
          { expiryDay: new Date(2027, 0, 1).getTime(), membershipName: '年卡', purchaseDate: DATE, remark: '', validityDay: 365 },
        ],
      }),
    })
    await loaded(page)
    expect(await screen.findByAltText('line_icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '會員卡清單' })).toBeInTheDocument()
  })

  it('店家沒開 LINE 顯示：已綁定的顧客也不顯示圖示', async () => {
    const page = setupQueue({ queue: withCustomer(), FETCH_CUSTOMER_DETAIL: customerDetail(CUSTOMER, { isLineBinded: true }) })
    await loaded(page)
    expect(screen.queryByAltText('line_icon')).toBeNull()
  })
})

describe('重新開單：帳單日期', () => {
  it('從日期選擇器改日期與時間：重試送出新的帳單日期', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.click(screen.getByDisplayValue('2026/10/21 15:00'))
    const dialog = await screen.findByRole('dialog', { name: '選擇日期與時間' })
    fireEvent.click(within(dialog).getByRole('gridcell', { name: '2026年10月20日' }))
    fireEvent.click(within(within(dialog).getByRole('listbox', { name: '時' })).getByText('11'))
    fireEvent.click(within(within(dialog).getByRole('listbox', { name: '分' })).getByText('30'))
    fireEvent.click(within(dialog).getByText('確認'))
    await wait(() => expect(screen.getByDisplayValue('2026/10/20 11:30')).toBeInTheDocument())
    const input = await retry(page.calls)
    expect(input.date).toBe(new Date(2026, 9, 20, 11, 30).getTime())
  })

  it('桌機直接打字：打到一半的無效日期不改帳單日期', async () => {
    const original = window.matchMedia
    window.matchMedia = query => ({ matches: query === '(pointer: fine)', addEventListener() {}, removeEventListener() {} })
    try {
      const page = setupQueue()
      await loaded(page)
      const dateInput = screen.getByDisplayValue('2026/10/21 15:00')
      fireEvent.focus(dateInput)
      fireEvent.keyDown(dateInput, { key: 'Backspace' })
      // 清掉一段後是無效日期：帳單日期維持原值
      fireEvent.click(screen.getByTestId('checkout'))
      await wait(() => expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
      expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')[0].variables.input.date).toBe(DATE)
    } finally {
      window.matchMedia = original
    }
  })
})

describe('重新開單：新增／編輯顧客按鈕', () => {
  it('鍵盤 Tab 到「新增顧客」按鈕：焦點停在按鈕上，按下開啟新增視窗', async () => {
    const page = setupQueue({ queue: noCustomerYet() })
    await loaded(page)
    const add = screen.getByRole('button', { name: '新增顧客' })
    add.focus()
    expect(document.activeElement).toBe(add)
    fireEvent.click(add)
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
  })

  it('查不到顧客資料時按「編輯顧客資料」：表單空白、不帶入任何人的資料', async () => {
    const page = setupQueue({ queue: withCustomer(), FETCH_CUSTOMER_DETAIL: { customer: null } })
    await loaded(page)
    const edit = screen.getByRole('button', { name: '編輯顧客資料' })
    edit.focus()
    expect(document.activeElement).toBe(edit)
    fireEvent.click(edit)
    const modal = (await screen.findByText('新增客戶')).closest('[role="dialog"]')
    expect(modal.querySelector('[name="name"]')).toHaveValue('')
    expect(modal.querySelector('[name="cellphone"]')).toHaveValue('')
  })
})

describe('重新開單：服務人員與指定方式', () => {
  it('點「不指定」：重試送出不指定', async () => {
    const page = setupQueue({ queue: baseQueue({ isDesignate: true }) })
    await loaded(page)
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    await wait(() => expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true'))
    const input = await retry(page.calls)
    expect(input.isDesignate).toBe(false)
  })

  // 焦點在服務人員欄時第一次點「不指定」：原本一律被當成「指定」，要點第二次才生效（coverage wave 1；2026/10/22 Jason 決定修正）
  it('焦點在服務人員欄時點「不指定」：第一次點就生效，重試送出不指定', async () => {
    const page = setupQueue({ queue: baseQueue({ isDesignate: true }) })
    await loaded(page)
    designerInput().focus()
    fireEvent.focusIn(designerInput())
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    await wait(() => expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true'))
    const input = await retry(page.calls)
    expect(input.isDesignate).toBe(false)
  })

  it('改選服務人員、切換「指定」：重試送出新的服務人員與指定', async () => {
    const page = setupQueue()
    await loaded(page)
    await pickOption(designerInput(), '李助理-02')
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    await wait(() => expect(screen.getByTestId('assign-designer-true')).toHaveAttribute('aria-pressed', 'true'))
    // 再按一次已選的項目不會取消選取
    fireEvent.click(screen.getByTestId('assign-designer-true'))
    const input = await retry(page.calls)
    expect(input).toEqual(expect.objectContaining({ designerId: ASSISTANT.userId, isDesignate: true }))
  })

  it('清除服務人員：「重試」停用並說明缺服務人員', async () => {
    const page = setupQueue()
    await loaded(page)
    fireEvent.focusIn(designerInput())
    fireEvent.mouseDown(designerInput().parentElement.querySelector('[aria-label="清除"]'))
    await wait(() => expect(screen.getByRole('status')).toHaveTextContent('服務人員'))
    expect(screen.getByTestId('checkout')).toBeDisabled()
  })

  it('鍵盤：服務人員按 Enter 跳到目前的指定方式；左右鍵切換指定／不指定；再按 Enter 跳到服務項目', async () => {
    const page = setupQueue({ queue: baseQueue({ isDesignate: true }) })
    await loaded(page)
    fireEvent.focusIn(designerInput())
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByTestId('assign-designer-true')))
    fireEvent.keyDown(screen.getByTestId('assign-designer-true'), { keyCode: 39 })
    await wait(() => expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.keyDown(screen.getByTestId('assign-designer-false'), { keyCode: 37 })
    await wait(() => expect(screen.getByTestId('assign-designer-true')).toHaveAttribute('aria-pressed', 'true'))
    fireEvent.keyDown(screen.getByTestId('assign-designer-true'), { keyCode: 9 })
    fireEvent.keyDown(screen.getByTestId('assign-designer-true'), { keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(inputOf(screen.getByTestId('service-0'))))
    // 不指定時 Enter 跳到「不指定」
    fireEvent.keyDown(screen.getByTestId('assign-designer-true'), { keyCode: 39 })
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByTestId('assign-designer-false')))
    // 其他按鍵不移動焦點
    designerInput().focus()
    fireEvent.keyDown(designerInput(), { key: 'a', keyCode: 65 })
    expect(document.activeElement).toBe(designerInput())
  })
})
