// 保護打帳單頁首「顧客」欄位的櫃台流程：
// - 輸入完整手機／編號按 Enter 直接帶入既有顧客；輸入新手機選「新增 "…"」以手機建立帳單（不帶 customerId，後端另建顧客）
// - 清除顧客後帳單不再帶顧客；勾／取消「不留客資」會清掉顧客、入金與點數，不會把上一位顧客的錢扣到不留客資的帳單
// - 店家開啟「自動帶入偏好設計師」時，選顧客即帶入其偏好設計師；顧客有會員卡購買紀錄／綁定 LINE 時顯示提示
// - 店家關閉「不留客資」時不顯示該選項，並清掉上次記住的勾選
// - 新增顧客：有手機時先以手機快速建檔再開編輯彈窗、帳單改帶新顧客 id；編輯顧客：彈窗帶入現有資料
// GraphQL 全由模擬 link 回應，不建立真實資料。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs, callsOf, typeLikeBrowser } from '../../../__tests__/testkit.test'
import {
  setupPage,
  waitPageReady,
  pickEmployee,
  pickService,
  pickCustomer,
  checkoutButton,
  sentOrder,
  CUSTOMER,
  CUSTOMER_DETAIL,
  DESIGNER,
  button,
  queryButton,
  findButton,
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

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')

describe('打帳單：顧客欄位', () => {
  // 搜尋結果只在有關鍵字時回傳（還沒輸入時清單是空的）
  const searchOnly = {
    FETCH_CUSTOMERS_IN_AUTO_COMPLETE: v => ({ customers: { customers: v.input.keyword ? [CUSTOMER] : [] } }),
  }

  it('輸入完整手機號碼按 Enter（搜尋結果還沒回來）：結果回來後直接帶入該位顧客並查詢顧客資料，結帳帶 customerId', async () => {
    const { calls } = setupPage(searchOnly)
    await waitPageReady()
    const input = customerInput()
    fireEvent.change(input, { target: { value: CUSTOMER.cellphone } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    // 防抖 800ms 後查到顧客，完全符合手機即選定
    await wait(() => expect(button('編輯顧客資料')).toBeInTheDocument(), { timeout: 3000 })
    await wait(() => expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(true))

    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).customerId).toBe(CUSTOMER.id)
  })

  it('輸入顧客編號按 Enter 也直接帶入', async () => {
    const { calls } = setupPage(searchOnly)
    await waitPageReady()
    const input = customerInput()
    fireEvent.change(input, { target: { value: CUSTOMER.no } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    await wait(() => expect(button('編輯顧客資料')).toBeInTheDocument(), { timeout: 3000 })
    expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(true)
  })

  it('輸入其他按鍵不會自動帶入（只有 Enter 才帶入）', async () => {
    const { calls } = setupPage(searchOnly)
    await waitPageReady()
    const input = customerInput()
    fireEvent.change(input, { target: { value: CUSTOMER.cellphone } })
    fireEvent.keyDown(input, { key: 'a', keyCode: 65 })
    // 等防抖查詢完成：選項出現但未自動選定
    expect(await screen.findByText('陳小姐/0912345678/C01', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(queryButton('編輯顧客資料')).toBeNull()
    expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(false)
  })

  it('輸入新手機選「新增」：帳單以手機號碼建立（不帶 customerId）', async () => {
    const { calls } = setupPage({ FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } } })
    await waitPageReady()
    fireEvent.change(customerInput(), { target: { value: '0988777666' } })
    fireEvent.click(await screen.findByText('0988777666', { selector: '[role="option"], [role="option"] *' }, { timeout: 3000 }))
    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const input = sentOrder(calls)
    expect(input.customerCellphone).toBe('0988777666')
    expect(input.customerId).toBeUndefined()
  })

  it('清除已選的顧客：帳單不再帶顧客，缺少顧客時不能結帳', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickCustomer(calls)
    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())

    act(() => customerInput().focus())
    fireEvent.mouseDown(button('清除'))
    await wait(() => expect(button('新增顧客')).toBeInTheDocument())
    await wait(() => expect(checkoutButton()).toBeDisabled())
    expect(screen.getByText(/尚缺/)).toHaveTextContent('顧客')
  })

  it('勾選「不留客資」會清掉已選的顧客與入金；取消勾選後須重新選顧客', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickCustomer(calls)
    expect(await screen.findByText(/入金剩餘/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('不留客資'))
    expect(screen.getByLabelText('不留客資')).toBeChecked()
    // 顧客欄清空並停用，入金區塊消失
    await wait(() => expect(customerInput()).toHaveValue(''))
    expect(customerInput()).toBeDisabled()
    expect(screen.queryByText(/入金剩餘/)).toBeNull()
    expect(JSON.parse(localStorage.getItem('stayInCheckoutWithoutCustomer'))).toBe(true)

    fireEvent.click(screen.getByLabelText('不留客資'))
    expect(screen.getByLabelText('不留客資')).not.toBeChecked()
    expect(customerInput()).not.toBeDisabled()
    expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBeNull()
    await pickEmployee()
    await pickService()
    expect(screen.getByText(/尚缺/)).toHaveTextContent('顧客')
  })

  it('上次勾選了「不留客資」：重新進入時維持勾選（記在本機）', async () => {
    localStorage.setItem('stayInCheckoutWithoutCustomer', true)
    const { calls } = setupPage()
    await waitPageReady()
    expect(screen.getByLabelText('不留客資')).toBeChecked()
    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).withoutCustomerData).toBe(true)
  })

  it('店家關閉「不留客資」：不顯示該選項，並清掉本機記住的勾選', async () => {
    localStorage.setItem('stayInCheckoutWithoutCustomer', true)
    setupPage({ GET_ORDER_WITHOUT_CUSTOMER_SETTING: { orderWithoutCustomerDefault: false } })
    await waitPageReady()
    await wait(() => expect(localStorage.getItem('stayInCheckoutWithoutCustomer')).toBeNull())
    expect(screen.queryByLabelText('不留客資')).toBeNull()
    expect(customerInput()).not.toBeDisabled()
  })

  it('開啟「自動帶入偏好設計師」：選顧客即帶入其偏好設計師；顧客有會員卡購買紀錄時顯示會員卡', async () => {
    const { calls } = setupPage({
      GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE: { getIsAutoSetPreferDesignerForOrderCreate: true },
      FETCH_CUSTOMER_DETAIL: v => ({
        customer: v.id
          ? {
              ...CUSTOMER_DETAIL,
              membershipPurchaseRecord: [
                // 後端回傳時間戳記（毫秒）
                {
                  expiryDay: new Date(2027, 9, 22).getTime(),
                  membershipName: '金卡',
                  purchaseDate: new Date(2026, 9, 22).getTime(),
                  remark: '生日禮',
                  validityDay: 365,
                },
              ],
            }
          : null,
      }),
    })
    await waitPageReady()
    await pickCustomer(calls)
    await wait(() => expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue(`${DESIGNER.userNickName}-${DESIGNER.userNo}`))
    // 會員卡清單按鈕：點開列出卡名與效期
    fireEvent.click(await findButton('會員卡清單'))
    expect(await screen.findByText('金卡')).toBeInTheDocument()
    expect(screen.getByText('效期: 2027/10/22')).toBeInTheDocument()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).designerId).toBe(DESIGNER.userId)
  })

  it('顧客沒有偏好設計師時不更動服務人員；店家開啟 LINE 綁定顯示時，已綁定 LINE 的顧客顯示 LINE 圖示', async () => {
    const { calls } = setupPage({
      GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE: { getIsAutoSetPreferDesignerForOrderCreate: true },
      GET_IS_LBCUS_DISPLAY: { getParameterOrderCreateSetting: { isLBCusDisplay: true } },
      FETCH_CUSTOMER_DETAIL: v => ({
        customer: v.id ? { ...CUSTOMER_DETAIL, preferDesigner: null, isLineBinded: true } : null,
      }),
    })
    await waitPageReady()
    await pickCustomer(calls)
    expect(await screen.findByAltText('line_icon')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('服務人員姓名/編號')[0]).toHaveValue('')
  })
})

describe('打帳單：新增／編輯顧客', () => {
  it('輸入新手機後按「新增顧客」：先以手機快速建檔，帳單改帶新顧客 id，並開啟彈窗補資料', async () => {
    const { calls } = setupPage({
      FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers: [] } },
      FETCH_ADD_CUSTOMER: {
        addCustomer: {
          id: 'customer-new',
          name: '0988777666',
          cellphone: '0988777666',
          gender: 'UNKNOWN',
          category: '',
          birthday: { year: '', month: '', day: '' },
        },
      },
    })
    await waitPageReady()
    fireEvent.change(customerInput(), { target: { value: '0988777666' } })
    fireEvent.click(await screen.findByText('0988777666', { selector: '[role="option"], [role="option"] *' }, { timeout: 3000 }))
    fireEvent.click(button('新增顧客'))
    await wait(() => expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.cellphone).toBe('0988777666')
    // 彈窗帶入快速建檔的顧客（已有 id，所以是編輯）
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
    expect(screen.getByLabelText('電話')).toHaveValue('0988777666')

    fireEvent.click(button('取消'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).customerId).toBe('customer-new')
  })

  it('尚未輸入顧客時按「新增顧客」：直接開啟空白的新增客戶彈窗，不先建檔', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    fireEvent.click(button('新增顧客'))
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('選定顧客後按「編輯顧客資料」：彈窗帶入該顧客現有資料', async () => {
    const { calls } = setupPage({
      FETCH_CUSTOMER_DETAIL: v => ({
        customer: v.id
          ? { ...CUSTOMER_DETAIL, remark: '過敏', source: '網路', latestDesigner: { id: DESIGNER.userId, name: DESIGNER.userName } }
          : null,
      }),
    })
    await waitPageReady()
    await pickCustomer(calls)
    fireEvent.click(button('編輯顧客資料'))
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
    expect(screen.getByLabelText('客戶姓名')).toHaveValue(CUSTOMER.name)
    expect(screen.getByLabelText('Email')).toHaveValue(CUSTOMER_DETAIL.email)
    expect(screen.getByLabelText('備註')).toHaveValue('過敏')
    expect(screen.getByLabelText('電話')).toHaveValue(CUSTOMER.cellphone)
  })
})

describe('打帳單：顧客欄位（邊界情況）', () => {
  const searchOnly = {
    FETCH_CUSTOMERS_IN_AUTO_COMPLETE: v => ({ customers: { customers: v.input.keyword ? [CUSTOMER] : [] } }),
  }

  it('只輸入部分手機按 Enter：搜尋結果不完全相符，不自動帶入', async () => {
    const { calls, settle } = setupPage(searchOnly)
    await waitPageReady()
    const input = customerInput()
    fireEvent.change(input, { target: { value: '0912' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    // 等防抖後的搜尋回來（結果有這位顧客，但手機不完全相符）
    await wait(() => expect(callsOf(calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').some(c => c.variables.input.keyword === '0912')).toBe(true), {
      timeout: 3000,
    })
    await settle()
    expect(queryButton('編輯顧客資料')).toBeNull()
    expect(callsOf(calls, 'FETCH_CUSTOMER_DETAIL').some(c => c.variables.id === CUSTOMER.id)).toBe(false)
  })

  it('顧客資料沒有會員卡紀錄欄位（null）：不顯示會員卡、頁面正常', async () => {
    const { calls } = setupPage({
      FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? { ...CUSTOMER_DETAIL, membershipPurchaseRecord: null } : null }),
    })
    await waitPageReady()
    await pickCustomer(calls)
    expect(await screen.findByText(/入金剩餘/)).toBeInTheDocument()
    expect(queryButton('會員卡清單')).toBeNull()
  })

  it('入金查回來前不顯示「入金可用餘額」，查回來後顯示', async () => {
    const { calls } = setupPage({}, { delays: { customerWallet: 400 } })
    await waitPageReady()
    await pickCustomer(calls)
    expect(screen.queryByText(/入金可用餘額/)).toBeNull()
    expect(await screen.findByText('入金可用餘額: 1500')).toBeInTheDocument()
  })

  it('選定的顧客查不到資料（例如已刪除）時按編輯：開啟空白表單，頁面不出錯', async () => {
    const { calls } = setupPage({ FETCH_CUSTOMER_DETAIL: { customer: null } })
    await waitPageReady()
    await pickCustomer(calls)
    fireEvent.click(button('編輯顧客資料'))
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
    expect(screen.getByLabelText('客戶姓名')).toHaveValue('')
  })

  it('顧客沒有偏好設計師、生日與性別：編輯表單的生日以空白帶入，頁面不出錯', async () => {
    const { calls } = setupPage({
      FETCH_CUSTOMER_DETAIL: v => ({
        customer: v.id ? { ...CUSTOMER_DETAIL, preferDesigner: null, birthday: null, gender: null } : null,
      }),
    })
    await waitPageReady()
    await pickCustomer(calls)
    fireEvent.click(button('編輯顧客資料'))
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
    expect(screen.getByLabelText('民國年')).toHaveValue('')
    expect(screen.getByLabelText('月')).toHaveValue('')
    expect(screen.getByLabelText('日')).toHaveValue('')
  })

  it('還沒選店家（本機沒有店家資料）：清除顧客、新增顧客都不出錯，新增時不帶店家', async () => {
    loginAs({ merchant: null })
    const { calls } = setupPage({
      FETCH_ADD_CUSTOMER: {
        addCustomer: { id: 'customer-new', name: '林小姐', cellphone: '0933111222', gender: 'MALE', birthday: { year: '', month: '', day: '' } },
      },
    })
    await waitPageReady()
    await pickCustomer(calls)
    act(() => customerInput().focus())
    fireEvent.mouseDown(button('清除'))
    await wait(() => expect(button('新增顧客')).toBeInTheDocument())
    fireEvent.click(button('新增顧客'))
    await screen.findByText('新增客戶')
    typeLikeBrowser(document.getElementById('addCustomerModal-name'), '林小姐')
    typeLikeBrowser(document.getElementById('addCustomerModal-cellphone'), '0933111222')
    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    await wait(() => expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.OfficialBrandMerchantId).toBeFalsy()
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })
})
