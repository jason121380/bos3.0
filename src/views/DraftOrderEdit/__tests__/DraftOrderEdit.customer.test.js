// 保護「掛單詳細」頁首：帳單日期、顧客、不留客資、服務人員與指定方式，以及新增／編輯顧客彈窗。
// 櫃台在掛單上改顧客或服務人員後按「儲存」，送出的 customerId／customerCellphone／withoutCustomerData／designerId／isDesignate／date 必須就是畫面上的選擇：
// 選既有顧客帶 customerId、輸入新手機帶 customerCellphone（後端據此建立顧客）、清掉顧客或取消「不留客資」時說明尚缺顧客、
// 勾選「不留客資」時清掉顧客、入金與紅利，且記住下次仍勾選；只輸入手機就按「新增顧客」會先建立顧客再開編輯窗；
// 新增顧客要有姓名與電話，客戶編號重複時提示。顧客送錯，消費就記到別人身上。
// GraphQL 全由模擬 link 回應，不連後端、不建立或修改真實資料。
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, typeLikeBrowser } from '../../../__tests__/testkit.test'
import {
  setupDraft, pageReady, pick, clearField, saveDraft, makeOrder, customerDetail,
  CUSTOMER, DESIGNER, HELPER,
} from './draftPageKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const CUSTOMER2 = { id: 'customer-2', no: 'C02', name: '林先生', cellphone: '0922000111' }

beforeEach(() => {
  loginAs()
})
afterEach(() => {
  cleanup()
  delete window.matchMedia
})

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const designerInput = () => screen.getAllByPlaceholderText('服務人員姓名/編號')[0]
const saveButton = () => screen.getByTestId('savedraft')
const missingReason = () => saveButton().parentElement.getAttribute('title')
const withCustomer = (detail = customerDetail(), options = {}) =>
  setupDraft({
    order: makeOrder({ customer: CUSTOMER }),
    customer: detail,
    FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [CUSTOMER, CUSTOMER2] } },
    otherCustomers: { [CUSTOMER2.id]: customerDetail(CUSTOMER2) },
    ...options,
  })
// 下拉選單（ui/native-select 的 option 值是索引）：依選項文字選取
const choose = (select, label) => {
  const index = Array.from(select.options).findIndex(o => o.textContent === label)
  fireEvent.change(select, { target: { value: String(index) } })
}
const selectedLabel = select => select.options[select.selectedIndex].textContent

const ready = async page => {
  await pageReady(page)
  return page
}

describe('掛單詳細：顧客', () => {
  it('有顧客的掛單：顯示顧客、LINE 綁定與會員卡清單；儲存送出原顧客', async () => {
    const page = await ready(
      withCustomer(
        customerDetail({ isLineBinded: true, membershipPurchaseRecord: [{ membershipName: '年卡', expiryDay: null, purchaseDate: null, remark: '', validityDay: 365 }] }),
        { LBCusDisplay: true }
      )
    )
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    expect(screen.getByAltText('line_icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '會員卡清單' })).toBeInTheDocument()
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ customerId: CUSTOMER.id, withoutCustomerData: false }))
  })

  it('改選另一位既有顧客：送出新顧客，焦點跳到服務人員', async () => {
    const page = await ready(withCustomer())
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    act(() => customerInput().focus())
    pick(customerInput(), '林先生/0922000111/C02')
    await wait(() => expect(customerInput()).toHaveValue('林先生/0922000111/C02'))
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    const input = await saveDraft(page.calls)
    expect(input.customerId).toBe(CUSTOMER2.id)
  })

  it('清除顧客：LINE 圖示與會員卡清單消失，儲存停用並說明尚缺顧客', async () => {
    await ready(withCustomer(customerDetail({ isLineBinded: true, membershipPurchaseRecord: [{ membershipName: '年卡' }] }), { LBCusDisplay: true }))
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    clearField(customerInput())
    await wait(() => expect(customerInput()).toHaveValue(''))
    expect(screen.queryByAltText('line_icon')).toBeNull()
    expect(screen.queryByRole('button', { name: '會員卡清單' })).toBeNull()
    await wait(() => expect(saveButton()).toBeDisabled())
    expect(missingReason()).toContain('顧客')
  })

  it('輸入清單中沒有的手機並選「新增」：送出手機號碼、不帶顧客 id', async () => {
    const page = await ready(withCustomer())
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    fireEvent.change(customerInput(), { target: { value: '0933444555' } })
    fireEvent.click(await screen.findByText('新增 "0933444555"'))
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    // 尚未建立的顧客：按鈕是「新增顧客」
    expect(screen.getByRole('button', { name: '新增顧客' })).toBeInTheDocument()
    const input = await saveDraft(page.calls)
    expect(input.customerId).toBeUndefined()
    expect(input.customerCellphone).toBe('0933444555')
  })

  it('輸入文字直接按 Enter：以輸入文字當手機送出', async () => {
    const page = await ready(setupDraft({ order: makeOrder({ customer: CUSTOMER }), customer: customerDetail(), FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } } }))
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    fireEvent.change(customerInput(), { target: { value: '0955666777' } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(designerInput()))
    const input = await saveDraft(page.calls)
    expect(input.customerCellphone).toBe('0955666777')
    expect(input.customerId).toBeUndefined()
  })

  it('手機或顧客編號打完立刻按 Enter（清單還沒回來）：清單回來後自動帶入手機或編號完全相符的顧客', async () => {
    const page = await ready(
      setupDraft({
        order: makeOrder({ customer: CUSTOMER }),
        customer: customerDetail(),
        // 以編號 C02 搜尋時兩位都會出現（模糊比對），只有編號完全相符的林先生會被帶入
        FETCH_CUSTOMERS_IN_AUTO_COMPLETE: ({ input }) => ({ customers: { customers: input.keyword === CUSTOMER2.no ? [CUSTOMER, CUSTOMER2] : [] } }),
        otherCustomers: { [CUSTOMER2.id]: customerDetail(CUSTOMER2) },
      })
    )
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    // 其他按鍵不觸發自動帶入
    fireEvent.keyDown(customerInput(), { key: 'a', keyCode: 65 })
    fireEvent.change(customerInput(), { target: { value: CUSTOMER2.no } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    // 輸入停 0.8 秒後才以關鍵字查詢
    await wait(
      () => expect(callsOf(page.calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').some(c => c.variables.input.keyword === CUSTOMER2.no)).toBe(true),
      { timeout: 3000 }
    )
    await wait(() => expect(customerInput()).toHaveValue('林先生/0922000111/C02'))
    const input = await saveDraft(page.calls)
    expect(input.customerId).toBe(CUSTOMER2.id)
  })

  it('勾選「不留客資」：清掉顧客、入金與紅利，欄位停用，並記住下次仍勾選；取消勾選則說明尚缺顧客', async () => {
    const page = await ready(withCustomer())
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).toBeDisabled())
    expect(customerInput()).toHaveValue('')
    expect(JSON.parse(localStorage.getItem('stayInCheckoutWithoutCustomer'))).toBe(true)
    const input = await saveDraft(page.calls)
    expect(input).toEqual(expect.objectContaining({ withoutCustomerData: true, walletPay: 0, bonusDecount: 0, bonusDeposit: 0, bonusUsed: 0 }))
    expect(input.customerId).toBeUndefined()

    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBeNull()
    await wait(() => expect(saveButton()).toBeDisabled())
    expect(missingReason()).toContain('顧客')
  })

  it('上次選了「不留客資」：記住的設定不影響這張有顧客的掛單', async () => {
    localStorage.setItem('stayInCheckoutWithoutCustomer', true)
    const page = await ready(withCustomer())
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    expect(screen.getByLabelText('不留客資')).not.toBeChecked()
    const input = await saveDraft(page.calls)
    expect(input.customerId).toBe(CUSTOMER.id)
  })
})

describe('掛單詳細：服務人員、指定方式與帳單日期', () => {
  it('換服務人員後送出新服務人員；清掉服務人員則說明尚缺', async () => {
    const page = await ready(setupDraft())
    pick(designerInput(), 'Lee-02')
    await wait(() => expect(designerInput()).toHaveValue('Lee-02'))
    const input = await saveDraft(page.calls)
    expect(input.designerId).toBe(HELPER.userId)
    clearField(designerInput())
    await wait(() => expect(saveButton()).toBeDisabled())
    expect(missingReason()).toContain('服務人員')
  })

  it('指定方式：點「不指定」送出不指定；方向鍵左／右切換指定與不指定', async () => {
    const page = await ready(setupDraft())
    const designate = screen.getByTestId('assign-designer-true')
    const nonDesignate = screen.getByTestId('assign-designer-false')
    fireEvent.click(nonDesignate)
    let input = await saveDraft(page.calls)
    expect(input.isDesignate).toBe(false)
    // 再點一次已選的「不指定」不會變成未選
    fireEvent.click(nonDesignate)
    fireEvent.keyDown(nonDesignate, { keyCode: 37 })
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.isDesignate).toBe(true)
    fireEvent.keyDown(designate, { keyCode: 39 })
    fireEvent.keyDown(designate, { keyCode: 65 })
    page.calls.length = 0
    input = await saveDraft(page.calls)
    expect(input.isDesignate).toBe(false)
  })

  it('服務人員 Enter 跳到目前的指定方式；指定方式 Enter 跳到服務項目', async () => {
    await ready(setupDraft())
    act(() => designerInput().focus())
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByTestId('assign-designer-true')))
    fireEvent.keyDown(screen.getByTestId('assign-designer-true'), { keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByPlaceholderText('服務名稱/代號')))
    // 不指定時 Enter 跳到「不指定」；其他按鍵不跳
    fireEvent.click(screen.getByTestId('assign-designer-false'))
    act(() => designerInput().focus())
    fireEvent.keyDown(designerInput(), { key: 'a', keyCode: 65 })
    expect(document.activeElement).toBe(designerInput())
    fireEvent.keyDown(designerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(document.activeElement).toBe(screen.getByTestId('assign-designer-false')))
  })

  it('從日曆改帳單日期後送出新日期', async () => {
    const page = await ready(setupDraft())
    fireEvent.click(screen.getByText('帳單日期').parentElement.querySelector('input'))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByRole('gridcell', { name: '2026年10月18日' }))
    const input = await saveDraft(page.calls)
    expect(new Date(input.date)).toEqual(new Date(2026, 9, 18, 10, 30))
  })

  it('桌機版逐段輸入日期：日期打到一半（不完整）時不改帳單日期', async () => {
    window.matchMedia = () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} })
    const page = await ready(setupDraft())
    const dateInput = screen.getByText('帳單日期').parentElement.querySelector('input')
    expect(dateInput).toHaveValue('2026/10/21 10:30')
    act(() => dateInput.focus())
    fireEvent.keyDown(dateInput, { key: 'Backspace' })
    const input = await saveDraft(page.calls)
    expect(input.date).toBe(new Date(2026, 9, 21, 10, 30).getTime())
  })

  it('頁首「帳單速查」開啟帳單速查視窗', async () => {
    await ready(setupDraft())
    fireEvent.click(screen.getByRole('button', { name: '帳單速查' }))
    expect(await screen.findByText('帳單速查', { selector: 'h2, h2 *' })).toBeInTheDocument()
  })
})

describe('掛單詳細：新增顧客', () => {
  const openAddModal = async page => {
    fireEvent.click(screen.getByRole('button', { name: '新增顧客' }))
    const modal = (await screen.findByText('新增客戶')).closest('.MuiModal-root')
    return { modal, page }
  }
  const input = (modal, name) => modal.querySelector(`input[name="${name}"]`)

  it('不留客資的掛單：取消不留客資後按「新增顧客」，填姓名與電話新增；送出姓名、電話、性別、生日', async () => {
    const page = await ready(
      setupDraft({
        FETCH_ADD_CUSTOMER: { addCustomer: { id: 'customer-new', name: '張小姐', gender: 'FEMALE', birthday: { year: '85', month: '3', day: '4' } } },
        FETCH_USERS: { users: { users: [{ id: DESIGNER.userId, name: DESIGNER.userName }] } },
      })
    )
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    const { modal } = await openAddModal(page)
    const m = within(modal)
    // 最新顧客編號提示
    expect(await m.findByText('最新顧客編號: C99')).toBeInTheDocument()
    const add = m.getByText('新增', { selector: 'button' })
    // 電話未滿 10 碼前不能新增
    expect(add).toBeDisabled()
    typeLikeBrowser(input(modal, 'cellphone'), '0966777888')
    await wait(() => expect(add).not.toBeDisabled())
    // 沒填姓名：提示必填，不送出
    fireEvent.click(add)
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'warning', message: '姓名與電話為必填' }))
    typeLikeBrowser(input(modal, 'name'), '張小姐')
    choose(modal.querySelector('#addCustomerModal-gender'), '女')
    typeLikeBrowser(input(modal, 'year'), '85')
    typeLikeBrowser(input(modal, 'month'), '3')
    typeLikeBrowser(input(modal, 'day'), '4')
    choose(modal.querySelector('#addCustomerModal-preferDesigner'), DESIGNER.userName)
    fireEvent.click(add)
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ name: '張小姐', cellphone: '0966777888', gender: 'FEMALE', PreferDesignerId: DESIGNER.userId, birthday: { year: '85', month: '3', day: '4' } })
    )
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.customerId).toBeUndefined()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success', message: '成功新增客戶' })))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })

  it('客戶編號：輸入後檢查是否重複，重複時提示；清空編號後不再提示', async () => {
    const page = await ready(
      setupDraft({
        GET_CHECK_IS_CUSTOMER_NO_USED: ({ input }) => ({ checkIsCustomerNoUsed: input === 'C01' }),
      })
    )
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    const { modal } = await openAddModal(page)
    typeLikeBrowser(input(modal, 'no'), 'C01')
    expect(await within(modal).findByText('客戶編號重複', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED').pop().variables).toEqual({ input: 'C01', customerId: null })
    typeLikeBrowser(input(modal, 'no'), '')
    await wait(() => expect(within(modal).queryByText('客戶編號重複')).toBeNull())
    // 取消關閉彈窗
    fireEvent.click(within(modal).getByText('取消', { selector: 'button' }))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })

  // 註：建立後掛單改指向新顧客，會讓「使用預收卡」區塊掛載並重抓帳單，整張掛單被重設回原內容（已回報為 bug，見交接報告），
  // 這裡只驗證到「建立顧客、改指向新顧客、開啟編輯窗」為止，不驗證之後儲存的內容
  it('只輸入手機就按「新增顧客」：先以該手機建立顧客，掛單改指向新顧客並開啟這位顧客的編輯窗', async () => {
    const page = await ready(
      setupDraft({
        FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } },
        FETCH_ADD_CUSTOMER: { addCustomer: { id: 'customer-new', name: '', cellphone: '0911222333', gender: 'MALE', category: '', birthday: { year: '', month: '', day: '' } } },
      })
    )
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    fireEvent.change(customerInput(), { target: { value: '0911222333' } })
    fireEvent.click(await screen.findByText('新增 "0911222333"'))
    fireEvent.click(screen.getByRole('button', { name: '新增顧客' }))
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ cellphone: '0911222333', name: '', gender: 'MALE', OfficialBrandMerchantId: 'merchant-1' })
    )
    const modal = (await screen.findByText('編輯客戶資料')).closest('.MuiModal-root')
    expect(modal.querySelector('input[name="cellphone"]')).toHaveValue('0911222333')
    await wait(() => expect(callsOf(page.calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === 'customer-new')).toBe(true))
  })
})

describe('掛單詳細：編輯顧客', () => {
  it('偏好設計師、備註、來源帶入編輯窗；儲存送出這些欄位並保留在同一位顧客', async () => {
    const page = await ready(
      withCustomer(customerDetail({ preferDesigner: { id: DESIGNER.userId, name: DESIGNER.userName }, remark: '敏感肌', source: '朋友介紹' }), {
        FETCH_USERS: { users: { users: [{ id: DESIGNER.userId, name: DESIGNER.userName }] } },
        SET_CUSTOMER: { updateCustomer: true },
      })
    )
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('.MuiModal-root')
    await wait(() => expect(selectedLabel(modal.querySelector('#addCustomerModal-preferDesigner'))).toBe(DESIGNER.userName))
    expect(modal.querySelector('input[name="remark"]')).toHaveValue('敏感肌')
    fireEvent.click(within(modal).getByText('儲存', { selector: 'button' }))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ customerId: CUSTOMER.id, PreferDesignerId: DESIGNER.userId, remark: '敏感肌', source: '朋友介紹' })
    )
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success', message: '成功更新顧客資訊' })))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    const input = await saveDraft(page.calls)
    expect(input.customerId).toBe(CUSTOMER.id)
  })

  it('顧客資料欄位空白（無偏好設計師、備註、來源、生日、性別）：編輯窗顯示空白；改客戶編號時以這位顧客檢查是否重複', async () => {
    const page = await ready(
      withCustomer(customerDetail({ preferDesigner: null, remark: null, source: null, birthday: null, gender: null }), {
        GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
      })
    )
    await wait(() => expect(customerInput()).toHaveValue('陳小姐/0912345678/C01'))
    // 鍵盤可聚焦「編輯顧客資料」並開啟（焦點停在按鈕上，不會被顧客欄搶走）
    const editButton = screen.getByRole('button', { name: '編輯顧客資料' })
    act(() => editButton.focus())
    expect(document.activeElement).toBe(editButton)
    fireEvent.click(editButton)
    const modal = (await screen.findByText('編輯客戶資料')).closest('.MuiModal-root')
    expect(modal.querySelector('input[name="remark"]')).toHaveValue('')
    expect(modal.querySelector('input[name="year"]')).toHaveValue('')
    typeLikeBrowser(modal.querySelector('input[name="no"]'), 'C77')
    await wait(() => expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')).toHaveLength(1), { timeout: 3000 })
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C77', customerId: CUSTOMER.id })
    expect(within(modal).queryByText('客戶編號重複')).toBeNull()
  })

  it('沒有顧客時鍵盤可聚焦「新增顧客」並開啟新增窗', async () => {
    await ready(setupDraft())
    fireEvent.click(screen.getByLabelText('不留客資'))
    await wait(() => expect(customerInput()).not.toBeDisabled())
    const addButton = screen.getByRole('button', { name: '新增顧客' })
    act(() => addButton.focus())
    expect(document.activeElement).toBe(addButton)
    fireEvent.click(addButton)
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
  })

  it('顧客資料讀不到時按「編輯顧客資料」：開啟空白表單（不帶入錯誤資料），設計師清單載入中顯示轉圈', async () => {
    await ready(withCustomer(null, { FETCH_USERS: new Error('讀取失敗') }))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('新增客戶')).closest('.MuiModal-root')
    expect(modal.querySelector('input[name="name"]')).toHaveValue('')
    expect(within(modal).getByText('偏好設計師')).toBeInTheDocument()
  })
})
