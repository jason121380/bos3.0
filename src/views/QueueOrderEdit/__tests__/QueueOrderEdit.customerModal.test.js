// 保護「重新開單」的新增／編輯顧客彈窗：
// - 顧客欄已輸入手機時按「新增顧客」：先以該手機建立顧客並帶進帳單，彈窗改為編輯這位新顧客，儲存送出填寫的資料；
// - 沒輸入手機時按「新增顧客」：填完整資料（姓名＋10 碼手機才能按「新增」）送出新增，姓名或電話空白時提示必填；
// - 客戶編號：輸入後檢查是否重複，重複時顯示「客戶編號重複」；
// - 送出失敗時以後端訊息提示，彈窗不關閉；「取消」關閉彈窗不送出。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實顧客。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, typeLikeBrowser } from '../../../__tests__/testkit.test'
import { setupQueue, loaded, baseQueue, chooseNative, retry, CUSTOMER, DESIGNER } from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

const customerInput = () => screen.getByPlaceholderText('顧客姓名/手機號碼/編號')
const noCustomerYet = () => baseQueue({ withoutCustomerData: false })
const NEW_CUSTOMER = { id: 'customer-9', category: '', name: '', cellphone: '0955666777', gender: 'MALE', birthday: { year: '', month: '', day: '' }, preferDesigner: null, source: null }
const openModal = async title => {
  fireEvent.click(screen.getByRole('button', { name: '新增顧客' }))
  return (await screen.findByText(title)).closest('[role="dialog"]')
}
const field = (modal, name) => modal.querySelector(`[name="${name}"]`)
const button = (modal, text) => within(modal).getByText(text, { selector: 'button' })

describe('重新開單：顧客欄已輸入手機時新增顧客', () => {
  it('先以手機建立顧客並帶入帳單；彈窗編輯這位新顧客，儲存送出填寫的姓名', async () => {
    const page = setupQueue({
      queue: noCustomerYet(),
      FETCH_ADD_CUSTOMER: { addCustomer: NEW_CUSTOMER },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await loaded(page)
    fireEvent.focusIn(customerInput())
    fireEvent.change(customerInput(), { target: { value: NEW_CUSTOMER.cellphone } })
    fireEvent.keyDown(customerInput(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(customerInput()).toHaveValue(NEW_CUSTOMER.cellphone))
    const modal = await openModal('編輯客戶資料')
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ cellphone: NEW_CUSTOMER.cellphone, OfficialBrandMerchantId: 'merchant-1', name: '' })
    )
    await wait(() => expect(field(modal, 'cellphone')).toHaveValue(NEW_CUSTOMER.cellphone))
    expect(within(modal).getByText('最新顧客編號: C99')).toBeInTheDocument()
    typeLikeBrowser(field(modal, 'name'), '張新客')
    typeLikeBrowser(field(modal, 'month'), '13')
    expect(field(modal, 'month')).toHaveValue('')
    typeLikeBrowser(field(modal, 'month'), '5')
    typeLikeBrowser(field(modal, 'day'), '32')
    typeLikeBrowser(field(modal, 'day'), '20')
    chooseNative(field(modal, 'gender'), '女')
    chooseNative(field(modal, 'PreferDesignerId'), DESIGNER.userName)
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({
        customerId: NEW_CUSTOMER.id,
        name: '張新客',
        gender: 'FEMALE',
        PreferDesignerId: DESIGNER.userId,
        birthday: { year: '', month: '5', day: '20' },
      })
    )
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '成功更新顧客資訊' }))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    // 帳單上的顧客是剛建立的顧客
    fireEvent.click(screen.getByTestId('checkout'))
    await wait(() => expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(callsOf(page.calls, 'FETCH_CREATE_ORDER')[0].variables.input.customerId).toBe(NEW_CUSTOMER.id)
  })

  it('更新顧客失敗：以後端訊息提示，彈窗不關閉', async () => {
    const page = setupQueue({
      queue: baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false }),
      SET_CUSTOMER: new Error('手機號碼已被使用'),
    })
    await loaded(page)
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
    await wait(() => expect(field(modal, 'name')).toHaveValue('陳小姐'))
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '手機號碼已被使用', variant: 'error' }))
    expect(screen.getByText('編輯客戶資料')).toBeInTheDocument()
  })
})

// 編輯顧客儲存：原本按下「儲存」就先把帳單的顧客清掉、成功後才放回，更新失敗時帳單就沒有顧客了（coverage wave 1，2026/10/22 修正）
describe('重新開單：編輯顧客儲存成功／失敗時帳單上的顧客', () => {
  const withCustomer = () => baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false })
  const openEdit = async () => {
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
    await wait(() => expect(field(modal, 'name')).toHaveValue('陳小姐'))
    return modal
  }

  it('更新失敗：帳單上的顧客保留，關閉彈窗後重試照樣送出原顧客', async () => {
    const page = setupQueue({ queue: withCustomer(), SET_CUSTOMER: new Error('手機號碼已被使用') })
    await loaded(page)
    const modal = await openEdit()
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '手機號碼已被使用', variant: 'error' }))
    fireEvent.click(button(modal, '取消'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    expect(customerInput().value).toContain('陳小姐')
    expect(screen.getByRole('button', { name: '編輯顧客資料' })).toBeInTheDocument()
    await page.settle()
    expect(screen.getByTestId('checkout')).not.toBeDisabled()
    const input = await retry(page.calls)
    expect(input.customerId).toBe(CUSTOMER.id)
  })

  it('更新成功：顧客欄顯示新姓名，重試送出同一位顧客', async () => {
    let name = '陳小姐'
    const page = setupQueue({
      queue: withCustomer(),
      FETCH_CUSTOMER_DETAIL: ({ id }) => ({ customer: id ? { ...CUSTOMER, name, membershipPurchaseRecord: [], isLineBinded: false } : null }),
      SET_CUSTOMER: ({ input }) => {
        name = input.name
        return { updateCustomer: true }
      },
    })
    await loaded(page)
    const modal = await openEdit()
    typeLikeBrowser(field(modal, 'name'), '陳美美')
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    await wait(() => expect(customerInput().value).toContain('陳美美'))
    const input = await retry(page.calls)
    expect(input.customerId).toBe(CUSTOMER.id)
  })

  it('更新成功但重新查詢顧客失敗：顧客欄維持原本顯示，帳單上的顧客保留', async () => {
    let detailCalls = 0
    const page = setupQueue({
      queue: withCustomer(),
      FETCH_CUSTOMER_DETAIL: ({ id }) => {
        if (!id) return { customer: null }
        detailCalls += 1
        return detailCalls > 1 ? new Error('查詢失敗') : { customer: { ...CUSTOMER, membershipPurchaseRecord: [], isLineBinded: false } }
      },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await loaded(page)
    const modal = await openEdit()
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())
    await wait(() => expect(detailCalls).toBe(2))
    await page.settle()
    expect(customerInput().value).toContain('陳小姐')
    const input = await retry(page.calls)
    expect(input.customerId).toBe(CUSTOMER.id)
  })
})

// 顧客沒有性別資料（null）：原本選單顯示「未知」但送出空字串；改為一律以 UNKNOWN 顯示與送出（coverage wave 1，2026/10/22）
describe('重新開單：編輯沒有性別資料的顧客', () => {
  it('性別顯示「未知」，儲存送出 UNKNOWN', async () => {
    const page = setupQueue({
      queue: baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false }),
      FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, gender: null, membershipPurchaseRecord: [], isLineBinded: false } },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await loaded(page)
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
    await wait(() => expect(field(modal, 'name')).toHaveValue('陳小姐'))
    const gender = field(modal, 'gender')
    expect(gender.options[gender.selectedIndex].textContent).toBe('未知')
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input.gender).toBe('UNKNOWN')
  })
})

describe('重新開單：編輯沒有生日資料的顧客', () => {
  it('生日欄空白；儲存送出空白生日，不會帶入其他值', async () => {
    const page = setupQueue({
      queue: baseQueue({ customerId: CUSTOMER.id, withoutCustomerData: false }),
      FETCH_CUSTOMER_DETAIL: { customer: { ...CUSTOMER, birthday: null, gender: 'MALE', remark: null, source: null, preferDesigner: { id: DESIGNER.userId, name: DESIGNER.userName }, membershipPurchaseRecord: [], isLineBinded: false } },
      SET_CUSTOMER: { updateCustomer: true },
    })
    await loaded(page)
    await wait(() => expect(customerInput().value).toContain('陳小姐'))
    fireEvent.click(screen.getByRole('button', { name: '編輯顧客資料' }))
    const modal = (await screen.findByText('編輯客戶資料')).closest('[role="dialog"]')
    expect(field(modal, 'year')).toHaveValue('')
    expect(field(modal, 'month')).toHaveValue('')
    expect(field(modal, 'day')).toHaveValue('')
    const prefer = field(modal, 'PreferDesignerId')
    expect(prefer.options[prefer.selectedIndex].textContent).toBe(DESIGNER.userName)
    fireEvent.click(button(modal, '儲存'))
    await wait(() => expect(callsOf(page.calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(page.calls, 'SET_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ customerId: CUSTOMER.id, birthday: { year: '', month: '', day: '' }, PreferDesignerId: DESIGNER.userId })
    )
  })
})

describe('重新開單：沒輸入手機時新增顧客', () => {
  it('姓名與 10 碼手機填好才能按「新增」；送出填寫的資料（不帶顧客 id 與來源），成功後關閉', async () => {
    const page = setupQueue({ queue: noCustomerYet(), FETCH_ADD_CUSTOMER: { addCustomer: { ...NEW_CUSTOMER, name: '吳小姐' } } })
    await loaded(page)
    const modal = await openModal('新增客戶')
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
    expect(button(modal, '新增')).toBeDisabled()
    typeLikeBrowser(field(modal, 'name'), '吳小姐')
    typeLikeBrowser(field(modal, 'cellphone'), '0955666777')
    await wait(() => expect(button(modal, '新增')).not.toBeDisabled())
    typeLikeBrowser(field(modal, 'email'), 'wu@example.com')
    typeLikeBrowser(field(modal, 'lineId'), 'wu-line')
    typeLikeBrowser(field(modal, 'address'), '台北市')
    typeLikeBrowser(field(modal, 'nickName'), '小吳')
    typeLikeBrowser(field(modal, 'remark'), '怕冷')
    typeLikeBrowser(field(modal, 'year'), '1234')
    typeLikeBrowser(field(modal, 'year'), '85')
    fireEvent.click(button(modal, '新增'))
    await wait(() => expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    const { input } = callsOf(page.calls, 'FETCH_ADD_CUSTOMER')[0].variables
    expect(input).toEqual(
      expect.objectContaining({
        name: '吳小姐', cellphone: '0955666777', email: 'wu@example.com', lineId: 'wu-line', address: '台北市', nickName: '小吳', remark: '怕冷',
        birthday: { year: '85', month: '', day: '' },
      })
    )
    expect(input).not.toHaveProperty('customerId')
    expect(input).not.toHaveProperty('source')
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增客戶', variant: 'success' }))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })

  // 填完整資料新增成功後，新顧客帶進帳單：原本只關閉彈窗，帳單仍沒有顧客（coverage wave 1，2026/10/22）
  it('新增成功：新顧客帶進帳單，顧客欄顯示新顧客，重試送出新顧客', async () => {
    const page = setupQueue({
      queue: noCustomerYet(),
      FETCH_ADD_CUSTOMER: { addCustomer: { ...NEW_CUSTOMER, name: '吳小姐' } },
      FETCH_CUSTOMER_DETAIL: ({ id }) => ({
        customer: id ? { ...NEW_CUSTOMER, no: 'C100', name: '吳小姐', membershipPurchaseRecord: [], isLineBinded: false } : null,
      }),
    })
    await loaded(page)
    const modal = await openModal('新增客戶')
    typeLikeBrowser(field(modal, 'name'), '吳小姐')
    typeLikeBrowser(field(modal, 'cellphone'), '0955666777')
    await wait(() => expect(button(modal, '新增')).not.toBeDisabled())
    fireEvent.click(button(modal, '新增'))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    await wait(() => expect(customerInput().value).toContain('吳小姐'))
    expect(screen.getByRole('button', { name: '編輯顧客資料' })).toBeInTheDocument()
    const input = await retry(page.calls)
    expect(input.customerId).toBe(NEW_CUSTOMER.id)
    expect(input.customerCellphone).toBe('')
  })

  it('姓名空白：提示「姓名與電話為必填」，不送出', async () => {
    const page = setupQueue({ queue: noCustomerYet() })
    await loaded(page)
    const modal = await openModal('新增客戶')
    typeLikeBrowser(field(modal, 'cellphone'), '0955666777')
    await wait(() => expect(button(modal, '新增')).not.toBeDisabled())
    fireEvent.click(button(modal, '新增'))
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'warning', message: '姓名與電話為必填' })
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('新增失敗：以後端訊息提示', async () => {
    const page = setupQueue({ queue: noCustomerYet(), FETCH_ADD_CUSTOMER: new Error('顧客已存在') })
    await loaded(page)
    const modal = await openModal('新增客戶')
    typeLikeBrowser(field(modal, 'name'), '吳小姐')
    typeLikeBrowser(field(modal, 'cellphone'), '0955666777')
    await wait(() => expect(button(modal, '新增')).not.toBeDisabled())
    fireEvent.click(button(modal, '新增'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '顧客已存在', variant: 'error' }))
  })

  it('客戶編號：輸入後檢查是否重複，重複時顯示「客戶編號重複」；清空後不再提示', async () => {
    const page = setupQueue({
      queue: noCustomerYet(),
      GET_CHECK_IS_CUSTOMER_NO_USED: ({ input }) => ({ checkIsCustomerNoUsed: input === 'C01' }),
    })
    await loaded(page)
    const modal = await openModal('新增客戶')
    typeLikeBrowser(field(modal, 'no'), 'C01')
    await wait(() => expect(within(modal).getByText('客戶編號重複')).toBeInTheDocument(), { timeout: 3000 })
    expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED').pop().variables).toEqual({ input: 'C01', customerId: null })
    typeLikeBrowser(field(modal, 'no'), 'C77')
    await wait(() => expect(within(modal).queryByText('客戶編號重複')).toBeNull(), { timeout: 3000 })
    await wait(() => expect(callsOf(page.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED').pop().variables.input).toBe('C77'), { timeout: 3000 })
    typeLikeBrowser(field(modal, 'no'), '')
    expect(within(modal).queryByText('客戶編號重複')).toBeNull()
  })

  it('偏好設計師清單載入中顯示載入狀態；「取消」關閉彈窗不送出', async () => {
    const page = setupQueue({ queue: noCustomerYet() }, { delays: { FETCH_USERS: 300 } })
    await screen.findByText(/重新開單 \(A777\)/)
    const modal = await openModal('新增客戶')
    expect(within(modal).getByText('載入中…')).toBeInTheDocument()
    await wait(() => expect(within(modal).queryByText('載入中…')).toBeNull())
    fireEvent.click(button(modal, '取消'))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    expect(callsOf(page.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })
})
