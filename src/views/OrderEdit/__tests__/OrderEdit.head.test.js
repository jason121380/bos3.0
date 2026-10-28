// 保護「帳單詳細」頁首（Head）：改帳單的顧客、日期、服務人員與指定方式，重新結帳送出的就是改過的內容。
// - 顧客：從搜尋結果選既有顧客（送 id、不送手機）；輸入新手機選「新增」或直接按 Enter（送手機、不送 id）；
//   打完手機馬上按 Enter、搜尋結果晚到時，結果回來後自動帶入該手機的顧客；按清除鈕清掉顧客後結帳停用並說明缺顧客
// - 不留客資：勾選後清掉顧客與扣入金、紅利（送出 withoutCustomerData），並記住這個選擇；取消勾選後不再記住
// - 日期：選另一天後送出新日期（時間不變）
// - 指定方式：點選（游標在服務人員欄時也一樣，第一次點就生效）或用鍵盤 ←／→ 切換；在服務人員欄按 Enter 跳到目前的指定方式，再按 Enter 跳到服務項目
// - 顧客標示：店家開啟 LINE 綁定顯示且顧客已綁定時顯示 LINE 圖示；有會員卡購買紀錄時顯示會員卡
// GraphQL 全由模擬 link 回應，不連後端、不改真實帳單或顧客。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { callsOf, typeLikeBrowser } from '../../../__tests__/testkit.test'
import {
  setup, pageReady, makeOrder, withCustomer, makeFullOrder, checkoutAndGetInput, loginForTest,
  OTHER_CUSTOMER, CUSTOMER_DETAIL, ASSISTANT, BILL_DATE, pickEmployee,
  findDialog, statusEl,
} from './orderEditKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginForTest())
afterEach(cleanup)

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const designerInput = () => screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
// 顧客搜尋：有輸入關鍵字才回傳另一位顧客（空白關鍵字回空清單，與後端相同）
const customerSearch = { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: v => ({ customers: { customers: v.input.keyword ? [OTHER_CUSTOMER] : [] } }) }
const customerShown = () => wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
// 原帳單不留客資：先取消不留客資才能輸入顧客
const enableCustomerField = () => fireEvent.click(screen.getByLabelText('不留客資'))

describe('帳單詳細：改顧客', () => {
  it('改選另一位既有顧客：送出新顧客的 id、不送手機，游標跳到服務人員', async () => {
    const page = setup({ ...customerSearch, order: withCustomer() })
    await pageReady(page)
    await customerShown()
    act(() => customerInput().focus())
    fireEvent.change(customerInput(), { target: { value: '0922' } })
    fireEvent.click(await screen.findByText('林先生/0922333444/C02', {}, { timeout: 3000 }))
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === OTHER_CUSTOMER.id)).toBe(true))
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ customerId: OTHER_CUSTOMER.id, customerCellphone: '', withoutCustomerData: false }))
  })

  it('打完手機馬上按 Enter、搜尋結果晚到：結果回來後自動帶入該手機的顧客', async () => {
    const page = setup({ ...customerSearch, order: withCustomer() })
    await pageReady(page)
    await customerShown()
    fireEvent.change(customerInput(), { target: { value: OTHER_CUSTOMER.cellphone } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === OTHER_CUSTOMER.id)).toBe(true), {
      timeout: 3000,
    })
    const input = await checkoutAndGetInput(page.calls)
    expect(input.customerId).toBe(OTHER_CUSTOMER.id)
  })

  it('輸入不在名單的文字按 Enter：以輸入內容當手機送出、不帶顧客 id', async () => {
    const page = setup(customerSearch)
    await pageReady(page)
    enableCustomerField()
    // 先按一般鍵（不是 Enter）再按 Enter，結果回來時不會被當成「快速 Enter」誤帶顧客
    fireEvent.change(customerInput(), { target: { value: '陳' } })
    fireEvent.keyDown(customerInput(), { key: 'a', keyCode: 65 })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').some(c => c.variables.input.keyword === '陳')).toBe(true), {
      timeout: 3000,
    })
    await page.settle()
    const input = await checkoutAndGetInput(page.calls)
    expect(input.customerId).toBeUndefined()
    expect(input.customerCellphone).toBe('陳')
  })

  it('輸入新手機選「新增 "…"」：以該手機送出新顧客，原顧客的會員卡標示清掉', async () => {
    const page = setup({
      ...customerSearch,
      order: withCustomer(),
      FETCH_CUSTOMER_DETAIL: {
        customer: { ...CUSTOMER_DETAIL, membershipPurchaseRecord: [{ membershipName: '金卡', expiryDay: 30, purchaseDate: BILL_DATE, remark: '', validityDay: 365 }] },
      },
    })
    await pageReady(page)
    await customerShown()
    fireEvent.change(customerInput(), { target: { value: '0999888777' } })
    fireEvent.click(await screen.findByText('新增 "0999888777"', {}, { timeout: 3000 }))
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.customerId).toBeUndefined()
    expect(input.customerCellphone).toBe('0999888777')
  })

  it('按清除鈕清掉顧客：結帳停用並說明缺顧客', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    await customerShown()
    act(() => customerInput().focus())
    fireEvent.mouseDown(await screen.findByLabelText('清除', { selector: 'button' }))
    await wait(() => expect(screen.getByTestId('checkout')).toBeDisabled())
    expect(statusEl()).toHaveTextContent('尚缺：顧客（或勾選「不留客資」）')
    expect(customerInput()).toHaveValue('')
  })
})

describe('帳單詳細：不留客資', () => {
  it('有顧客的帳單勾選不留客資：送出不留客資、不帶顧客，扣入金與紅利歸零，並記住這個選擇', async () => {
    const page = setup({ order: makeFullOrder(), customerWallet: { customerWallet: 1000 } })
    await pageReady(page)
    await customerShown()
    fireEvent.click(screen.getByLabelText('不留客資'))
    expect(customerInput()).toBeDisabled()
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBe('true')
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(
      expect.objectContaining({ withoutCustomerData: true, walletPay: 0, bonusDecount: 0, bonusDeposit: 0, bonusUsed: 0 })
    )
    expect(input.customerId).toBeUndefined()
  })

  it('取消勾選不留客資：不再記住這個選擇，顧客欄可輸入', async () => {
    localStorage.setItem('stayInCheckoutWithoutCustomer', true)
    const page = setup()
    await pageReady(page)
    expect(customerInput()).toBeDisabled()
    fireEvent.click(screen.getByLabelText('不留客資'))
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBeNull()
    expect(customerInput()).not.toBeDisabled()
    await wait(() => expect(screen.getByTestId('checkout')).toBeDisabled())
  })
})

describe('帳單詳細：日期、服務人員與指定方式', () => {
  it('改帳單日期為 10/15：送出 10/15、時間維持 10:30', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.click(screen.getByLabelText('選擇日期，目前為 2026/10/21'))
    const picker = await findDialog()
    fireEvent.click(within(picker).getByLabelText('2026年10月15日'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input.date).toBe(new Date(2026, 9, 15, 10, 30).getTime())
  })

  it('桌機（滑鼠）直接輸入日期：輸入到一半（年份清空）不改帳單日期，輸入完整年份後才改', async () => {
    // 有滑鼠的裝置（pointer: fine）日期欄可直接打字
    const original = window.matchMedia
    window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} })
    try {
      const page = setup()
      await pageReady(page)
      const date = screen.getByDisplayValue('2026/10/21 10:30')
      date.focus()
      fireEvent.keyDown(date, { key: 'Backspace' })
      expect(date).toHaveValue('YYYY/10/21 10:30')
      for (const key of '2025') fireEvent.keyDown(date, { key })
      expect(date).toHaveValue('2025/10/21 10:30')
      expect((await checkoutAndGetInput(page.calls)).date).toBe(new Date(2025, 9, 21, 10, 30).getTime())
      cleanup()

      const halfway = setup()
      await pageReady(halfway)
      const field = screen.getByDisplayValue('2026/10/21 10:30')
      field.focus()
      fireEvent.keyDown(field, { key: 'Backspace' })
      expect((await checkoutAndGetInput(halfway.calls)).date).toBe(BILL_DATE)
    } finally {
      window.matchMedia = original
    }
  })

  it('點「不指定」送出不指定；再點一次已選的項目不變', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    expect((await checkoutAndGetInput(page.calls)).isDesignate).toBe(false)
  })

  it('游標還在服務人員欄時直接點「不指定」：第一次點就是不指定（不會被當成指定）', async () => {
    const page = setup()
    await pageReady(page)
    act(() => designerInput().focus())
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    expect((await checkoutAndGetInput(page.calls)).isDesignate).toBe(false)
  })

  it('鍵盤：在指定方式按 → 為不指定、← 為指定；按 Enter 跳到服務項目', async () => {
    const page = setup()
    await pageReady(page)
    const designate = screen.getByTestId('assign-designer-true')
    fireEvent.keyDown(designate, { keyCode: 39 })
    expect(screen.getByTestId('assign-designer-false')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(designate, { keyCode: 37 })
    expect(designate).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(designate, { keyCode: 65 })
    expect(designate).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(designate, { keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByPlaceholderText('服務名稱/代號')))
  })

  it('在服務人員欄按 Enter：跳到目前的指定方式（指定→「指定」、不指定→「不指定」）', async () => {
    const page = setup()
    await pageReady(page)
    fireEvent.keyDown(designerInput(), { key: 'a', keyCode: 65 })
    expect(document.activeElement).not.toBe(screen.getByTestId('assign-designer-true'))
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    expect(document.activeElement).toBe(screen.getByTestId('assign-designer-true'))
    cleanup()

    const undesignated = setup({ order: makeOrder({ isDesignate: false }) })
    await pageReady(undesignated)
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    expect(document.activeElement).toBe(screen.getByTestId('assign-designer-false'))
  })

  it('改服務人員：送出新的服務人員', async () => {
    const page = setup()
    await pageReady(page)
    await pickEmployee(designerInput(), '李助理')
    expect((await checkoutAndGetInput(page.calls)).designerId).toBe(ASSISTANT.userId)
  })
})

describe('帳單詳細：顧客標示', () => {
  it('店家開啟 LINE 綁定顯示、顧客已綁定：顯示 LINE 圖示；有會員卡購買紀錄時顯示會員卡', async () => {
    const page = setup({
      order: withCustomer(),
      GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: true } },
      FETCH_CUSTOMER_DETAIL: {
        customer: {
          ...CUSTOMER_DETAIL,
          isLineBinded: true,
          membershipPurchaseRecord: [{ membershipName: '金卡', expiryDay: 30, purchaseDate: BILL_DATE, remark: '', validityDay: 365 }],
        },
      },
    })
    await pageReady(page)
    expect(await screen.findByAltText('line_icon')).toBeInTheDocument()
    expect(screen.getByLabelText('會員卡清單', { selector: 'button' })).toBeInTheDocument()
  })

  it('顧客已綁定 LINE 但店家沒開啟顯示：不顯示 LINE 圖示', async () => {
    const page = setup({ order: withCustomer(), FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER_DETAIL, isLineBinded: true } } })
    await pageReady(page)
    expect(screen.queryByAltText('line_icon')).toBeNull()
  })
})

describe('帳單詳細：新增／編輯顧客彈窗的開啟', () => {
  const modalTitle = () => screen.findByText(/^(新增客戶|編輯客戶資料)$/)

  it('取消不留客資後又勾回去（中間沒選顧客）：仍是不留客資，可直接重新結帳', async () => {
    const page = setup()
    await pageReady(page)
    enableCustomerField()
    fireEvent.click(screen.getByLabelText('不留客資'))
    expect(screen.getByLabelText('不留客資')).toBeChecked()
    const input = await checkoutAndGetInput(page.calls)
    expect(input.withoutCustomerData).toBe(true)
  })

  it('以完整表單新增顧客成功：新顧客帶進帳單（顧客欄顯示新顧客），重新結帳送出新顧客', async () => {
    const page = setup({
      FETCH_ADD_CUSTOMER: {
        addCustomer: { id: 'customer-new', name: '林先生', gender: 'MALE', cellphone: '0922333444', birthday: { year: '', month: '', day: '' }, category: '' },
      },
    })
    await pageReady(page)
    enableCustomerField()
    fireEvent.click(screen.getByLabelText('新增顧客', { selector: 'button' }))
    const modal = (await modalTitle()).closest('[role="dialog"]')
    typeLikeBrowser(modal.querySelector('input[name="name"]'), '林先生')
    typeLikeBrowser(modal.querySelector('input[name="cellphone"]'), '0922333444')
    const add = within(modal).getByText('新增', { selector: 'button' })
    await wait(() => expect(add).not.toBeDisabled())
    fireEvent.click(add)
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    await wait(() => expect(customerInput()).toHaveValue('林先生/0922333444/C02'))
    const input = await checkoutAndGetInput(page.calls)
    expect(input).toEqual(expect.objectContaining({ customerId: 'customer-new', customerCellphone: '', withoutCustomerData: false }))
  })

  it('顧客欄沒輸入就按「新增顧客」：開空白的新增客戶彈窗，不先建立顧客', async () => {
    const page = setup()
    await pageReady(page)
    enableCustomerField()
    fireEvent.click(screen.getByLabelText('新增顧客', { selector: 'button' }))
    expect(await modalTitle()).toHaveTextContent('新增客戶')
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('編輯顧客：彈窗帶入顧客的偏好設計師、備註與來源', async () => {
    const page = setup({
      order: withCustomer(),
      FETCH_USERS: { users: { users: [{ id: 'designer-1', name: '王小美' }] } },
      FETCH_CUSTOMER_DETAIL: {
        customer: { ...CUSTOMER_DETAIL, preferDesigner: { id: 'designer-1', name: '王小美' }, remark: '對洗髮精過敏', source: '網路' },
      },
    })
    await pageReady(page)
    await customerShown()
    fireEvent.click(screen.getByLabelText('編輯顧客資料', { selector: 'button' }))
    const modal = (await modalTitle()).closest('[role="dialog"]')
    expect(modal.querySelector('input[name="remark"]')).toHaveValue('對洗髮精過敏')
    await wait(() => expect(within(modal).getByDisplayValue('網路')).toBeInTheDocument())
    await wait(() => expect(within(modal).getByDisplayValue('王小美')).toBeInTheDocument())
  })

  it('編輯沒填備註與來源的顧客：兩欄空白（不顯示 null）', async () => {
    const page = setup({ order: withCustomer() })
    await pageReady(page)
    await customerShown()
    fireEvent.click(screen.getByLabelText('編輯顧客資料', { selector: 'button' }))
    const modal = (await modalTitle()).closest('[role="dialog"]')
    expect(modal.querySelector('input[name="remark"]')).toHaveValue('')
    expect(within(modal).queryByDisplayValue('null')).toBeNull()
  })

  it('顧客資料讀不到（例如已被刪除）時按編輯：開空白表單，不帶任何舊資料', async () => {
    const page = setup({ order: withCustomer(), FETCH_CUSTOMER_DETAIL: { customer: null } })
    await pageReady(page)
    fireEvent.click(screen.getByLabelText('編輯顧客資料', { selector: 'button' }))
    const modal = (await modalTitle()).closest('[role="dialog"]')
    expect(modal.querySelector('input[name="name"]')).toHaveValue('')
    expect(modal.querySelector('input[name="cellphone"]')).toHaveValue('')
  })
})

describe('帳單詳細：在彈窗編輯顧客後的帳單顧客', () => {
  const openEdit = async () => {
    await customerShown()
    fireEvent.click(screen.getByLabelText('編輯顧客資料', { selector: 'button' }))
    return (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
  }

  it('更新顧客失敗後關閉彈窗：帳單仍是原顧客，照樣可重新結帳', async () => {
    const page = setup({ order: withCustomer(), SET_CUSTOMER: new Error('顧客資料已被刪除') })
    await pageReady(page)
    const modal = await openEdit()
    fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    await page.settle()
    fireEvent.click(within(modal).getByText('取消', { selector: 'button' }))
    await customerShown()
    const input = await checkoutAndGetInput(page.calls)
    expect(input.customerId).toBe(CUSTOMER_DETAIL.id)
  })

  it('更新顧客成功：顧客欄改顯示更新後的姓名', async () => {
    let updated = false
    const page = setup({
      order: withCustomer(),
      SET_CUSTOMER: () => {
        updated = true
        return { updateCustomer: true }
      },
      FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? { ...CUSTOMER_DETAIL, name: updated ? '陳美美' : CUSTOMER_DETAIL.name } : null }),
    })
    await pageReady(page)
    const modal = await openEdit()
    const name = modal.querySelector('input[name="name"]')
    await wait(() => expect(name).toHaveValue('陳小姐'))
    typeLikeBrowser(name, '陳美美')
    fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(customerInput()).toHaveValue('陳美美/0912345678/C01'))
    expect((await checkoutAndGetInput(page.calls)).customerId).toBe(CUSTOMER_DETAIL.id)
  })
})
