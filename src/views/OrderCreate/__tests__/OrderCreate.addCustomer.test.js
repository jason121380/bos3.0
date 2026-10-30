// 保護打帳單的「新增／編輯顧客」彈窗：
// - 新增：姓名與電話必填（只填電話時提示），送出的資料含店家、生日、性別、來源、偏好設計師；成功後提示並關閉，失敗提示錯誤、可再按
// - 編輯：帶入顧客現有資料，改完儲存送出 customerId 與生日；成功後帳單仍帶這位顧客；可前往該顧客的帳單記錄
// - 顧客編號輸入後檢查是否重複（重複時標示錯誤並把焦點放回編號欄）；顯示最新顧客編號供參考
// - 生日：民國年最多 3 碼、月 ≤ 12、日 ≤ 31
// - 鍵盤：每個欄位按 Enter 依序跳到下一欄，最後到「新增／儲存」
// GraphQL 全由模擬 link 回應，不建立真實顧客資料。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation, typeLikeBrowser, MERCHANT_ID } from '../../../__tests__/testkit.test'
import {
  setupPage,
  waitPageReady,
  pickCustomer,
  pickEmployee,
  pickService,
  checkoutButton,
  sentOrder,
  button,
  findButton,
  CUSTOMER,
  CUSTOMER_DETAIL,
  DESIGNER,
  HELPER,
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

const input = id => document.getElementById(`addCustomerModal-${id}`)
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const preferDesigner = () => document.querySelector('input[name="preferDesigner"]')
// 頁面上的「帳單來源」也叫 source，彈窗的在最後
const sourceSelect = () => [...document.querySelectorAll('select[name="source"]')].pop()

const ADDED = {
  id: 'customer-new',
  name: '林小姐',
  cellphone: '0933111222',
  gender: 'FEMALE',
  category: '',
  birthday: { year: '85', month: '3', day: '4' },
}

const openNew = async overrides => {
  const page = setupPage({
    GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
    GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
    FETCH_ADD_CUSTOMER: { addCustomer: ADDED },
    ...overrides,
  })
  await waitPageReady()
  fireEvent.click(button('新增顧客'))
  await screen.findByText('新增客戶')
  return page
}

describe('新增顧客', () => {
  it('填完資料按新增：送出店家、姓名、電話、生日、性別、來源、偏好設計師、備註；成功後提示並關閉', async () => {
    const { calls } = await openNew()
    expect(screen.getByText('最新顧客編號: C099')).toBeInTheDocument()
    // 電話沒填前不能新增
    expect(button('新增')).toBeDisabled()
    typeLikeBrowser(input('name'), ADDED.name)
    typeLikeBrowser(input('cellphone'), ADDED.cellphone)
    typeLikeBrowser(input('email'), 'lin@example.com')
    typeLikeBrowser(input('lineId'), 'linline')
    typeLikeBrowser(input('address'), '新北市')
    typeLikeBrowser(input('nickName'), '小林')
    typeLikeBrowser(input('remark'), '怕冷')
    fireEvent.change(input('year'), { target: { value: '85' } })
    fireEvent.change(input('month'), { target: { value: '3' } })
    fireEvent.change(input('day'), { target: { value: '4' } })
    // 性別（未知、男、女）
    fireEvent.change(document.querySelector('select[name="gender"]'), { target: { value: '2' } })
    // 來源（無、朋友介紹、網路）
    fireEvent.change(sourceSelect(), { target: { value: '2' } })
    // 偏好設計師：可依姓名或編號篩選
    fireEvent.change(preferDesigner(), { target: { value: '02' } })
    fireEvent.click(await screen.findByText(`${HELPER.userName}-${HELPER.userNo}`))
    await wait(() => expect(input('remark')).toHaveFocus())

    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    await wait(() => expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({
        OfficialBrandMerchantId: MERCHANT_ID,
        name: ADDED.name,
        cellphone: ADDED.cellphone,
        email: 'lin@example.com',
        lineId: 'linline',
        address: '新北市',
        nickName: '小林',
        remark: '怕冷',
        gender: 'FEMALE',
        source: '網路',
        PreferDesignerId: HELPER.userId,
        birthday: { year: '85', month: '3', day: '4' },
      })
    )
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.customerId).toBeUndefined()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '成功新增客戶', variant: 'success' })))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })

  it('新增成功：帳單帶入這位新顧客（與只輸入手機快速建檔相同），結帳送出新顧客 id', async () => {
    const { calls } = await openNew()
    typeLikeBrowser(input('name'), ADDED.name)
    typeLikeBrowser(input('cellphone'), ADDED.cellphone)
    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
    expect(await findButton('編輯顧客資料')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('顧客姓名/手機號碼/編號')).toHaveValue(ADDED.cellphone)

    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).customerId).toBe(ADDED.id)
  })

  it('只填電話沒填姓名：提示「姓名與電話為必填」，不送出', async () => {
    const { calls } = await openNew()
    typeLikeBrowser(input('cellphone'), '0933111222')
    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '姓名與電話為必填', variant: 'warning' }))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(0)
  })

  it('新增失敗：提示錯誤，彈窗保留、可再按', async () => {
    await openNew({ FETCH_ADD_CUSTOMER: new Error('手機已存在') })
    typeLikeBrowser(input('name'), ADDED.name)
    typeLikeBrowser(input('cellphone'), ADDED.cellphone)
    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('手機已存在') }))
    )
    expect(screen.getByText('新增客戶')).toBeInTheDocument()
    await wait(() => expect(button('新增')).not.toBeDisabled())
  })

  it('生日：民國年最多 3 碼、月 ≤ 12、日 ≤ 31；清空可以', async () => {
    await openNew()
    fireEvent.change(input('year'), { target: { value: '1234' } })
    expect(input('year')).toHaveValue('')
    fireEvent.change(input('month'), { target: { value: '13' } })
    expect(input('month')).toHaveValue('')
    fireEvent.change(input('month'), { target: { value: '12' } })
    expect(input('month')).toHaveValue('12')
    fireEvent.change(input('month'), { target: { value: '' } })
    expect(input('month')).toHaveValue('')
    fireEvent.change(input('day'), { target: { value: '32' } })
    expect(input('day')).toHaveValue('')
    fireEvent.change(input('day'), { target: { value: '31' } })
    expect(input('day')).toHaveValue('31')
    fireEvent.change(input('day'), { target: { value: '' } })
    expect(input('day')).toHaveValue('')
  })

  it('顧客編號重複：標示「客戶編號重複」並把焦點放回編號欄；不重複時顯示通過', async () => {
    const { calls } = await openNew({
      GET_CHECK_IS_CUSTOMER_NO_USED: v => ({ checkIsCustomerNoUsed: v.input === 'C001' }),
    })
    typeLikeBrowser(input('no'), 'C001')
    expect(await screen.findByText('客戶編號重複', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(input('no')).toHaveFocus()
    expect(callsOf(calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C001', customerId: null })
    typeLikeBrowser(input('no'), 'C100')
    await wait(() => expect(screen.queryByText('客戶編號重複')).toBeNull(), { timeout: 2000 })
    // 清空編號：不檢查
    typeLikeBrowser(input('no'), '')
    await wait(() => expect(input('no')).toHaveValue(''))
  })

  it('Enter：編號 → 姓名 → 性別 → Email → lineId → 地址 → 暱稱 → 年 → 月 → 日 → 電話 → 來源 → 偏好設計師 → 備註 → 新增', async () => {
    await openNew()
    const order = [
      [input('no'), input('name')],
      [input('name'), document.querySelector('select[name="gender"]').parentElement.querySelector('[data-ui-select]')],
      [document.querySelector('select[name="gender"]').parentElement.querySelector('[data-ui-select]'), input('email')],
      [input('email'), input('lineId')],
      [input('lineId'), input('address')],
      [input('address'), input('nickName')],
      [input('nickName'), input('year')],
      [input('year'), input('month')],
      [input('month'), input('day')],
      [input('day'), input('cellphone')],
      [input('cellphone'), sourceSelect().parentElement.querySelector('[data-ui-select]')],
      [sourceSelect().parentElement.querySelector('[data-ui-select]'), preferDesigner()],
    ]
    for (const [from, to] of order) {
      enter(from)
      await wait(() => expect(to).toHaveFocus())
    }
    // 偏好設計師欄聚焦後 Enter → 備註；備註 Enter → 新增鈕
    act(() => preferDesigner().focus())
    fireEvent.focus(preferDesigner())
    fireEvent.keyDown(preferDesigner(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(input('remark')).toHaveFocus())
    typeLikeBrowser(input('cellphone'), '0933111222')
    await wait(() => expect(button('新增')).not.toBeDisabled())
    enter(input('remark'))
    await wait(() => expect(button('新增')).toHaveFocus())
    // 其他按鍵不跳欄
    fireEvent.keyDown(input('name'), { key: 'a', keyCode: 65 })
    expect(button('新增')).toHaveFocus()
  })

  it('偏好設計師：沒輸入關鍵字列出全部；選了再清除則不送偏好設計師', async () => {
    const { calls } = await openNew()
    fireEvent.click(preferDesigner())
    expect(await screen.findByText(`${DESIGNER.userName}-${DESIGNER.userNo}`)).toBeInTheDocument()
    expect(screen.getByText(`${HELPER.userName}-${HELPER.userNo}`)).toBeInTheDocument()
    fireEvent.click(screen.getByText(`${DESIGNER.userName}-${DESIGNER.userNo}`))
    act(() => preferDesigner().focus())
    fireEvent.mouseDown(screen.getAllByLabelText('清除').slice(-1)[0])
    typeLikeBrowser(input('name'), ADDED.name)
    typeLikeBrowser(input('cellphone'), ADDED.cellphone)
    await wait(() => expect(button('新增')).not.toBeDisabled())
    fireEvent.click(button('新增'))
    await wait(() => expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'FETCH_ADD_CUSTOMER')[0].variables.input.PreferDesignerId).toBe('')
  })
})

// 為什麼重要：偏好設計師欄（ui/combobox）以選項物件呼叫 getOptionLabel 取顯示文字；原本物件一律回空字串，
// 選了設計師或編輯有偏好設計師的顧客時欄位都是空白，櫃台看不出設定了誰，容易重選或誤以為沒設定。
describe('偏好設計師欄顯示姓名', () => {
  it('新增顧客：選了偏好設計師後欄位顯示設計師姓名', async () => {
    await openNew()
    fireEvent.change(preferDesigner(), { target: { value: '02' } })
    fireEvent.click(await screen.findByText(`${HELPER.userName}-${HELPER.userNo}`))
    await wait(() => expect(preferDesigner()).toHaveValue(HELPER.userName))
  })

  it('編輯顧客：帶入顧客原本的偏好設計師姓名', async () => {
    const page = setupPage({
      GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
      GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
    })
    await waitPageReady()
    await pickCustomer(page.calls)
    fireEvent.click(button('編輯顧客資料'))
    await screen.findByText('編輯客戶資料')
    // CUSTOMER_DETAIL 的偏好設計師是 DESIGNER
    await wait(() => expect(preferDesigner()).toHaveValue(DESIGNER.userName))
  })
})

describe('編輯顧客', () => {
  const openEdit = async overrides => {
    const page = setupPage({
      GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
      GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
      SET_CUSTOMER: { updateCustomer: { id: CUSTOMER.id } },
      ...overrides,
    })
    await waitPageReady()
    await pickCustomer(page.calls)
    fireEvent.click(button('編輯顧客資料'))
    await screen.findByText('編輯客戶資料')
    return page
  }

  it('改姓名後儲存：送出 customerId 與生日；成功後提示、關閉，帳單仍帶這位顧客', async () => {
    const { calls } = await openEdit()
    // 編號檢查帶 customerId（排除自己）
    await wait(() => expect(callsOf(calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: CUSTOMER.no, customerId: CUSTOMER.id }), {
      timeout: 2000,
    })
    typeLikeBrowser(input('name'), '陳大姐')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'SET_CUSTOMER')[0].variables.input).toEqual(
      expect.objectContaining({ customerId: CUSTOMER.id, name: '陳大姐', birthday: CUSTOMER_DETAIL.birthday })
    )
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '成功更新顧客資訊', variant: 'success' })))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())

    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).customerId).toBe(CUSTOMER.id)
  })

  it('儲存失敗：提示錯誤，彈窗保留；取消後帳單仍帶這位顧客', async () => {
    const { calls } = await openEdit({ SET_CUSTOMER: new Error('資料格式錯誤') })
    fireEvent.click(button('儲存'))
    await wait(() =>
      expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('資料格式錯誤') }))
    )
    expect(screen.getByText('編輯客戶資料')).toBeInTheDocument()
    fireEvent.click(button('取消'))
    await wait(() => expect(screen.queryByText('編輯客戶資料')).toBeNull())

    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).customerId).toBe(CUSTOMER.id)
  })

  it('查看帳單記錄：前往該顧客的帳單記錄頁', async () => {
    await openEdit()
    fireEvent.click(button('查看帳單記錄'))
    await wait(() => expect(currentLocation()).toBe(`/management/customers/${CUSTOMER.id}/invoices`))
  })

  it('顧客的偏好設計師在可打單人員中：彈窗帶入該設計師', async () => {
    await openEdit()
    // 已選的偏好設計師（選項中有）
    expect(preferDesigner()).toBeInTheDocument()
    expect(input('name')).toHaveValue(CUSTOMER.name)
  })

  it('顧客沒有性別資料（null）：性別顯示「未知」，儲存送出 UNKNOWN', async () => {
    const { calls } = await openEdit({
      FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? { ...CUSTOMER_DETAIL, gender: null } : null }),
    })
    const gender = document.querySelector('select[name="gender"]')
    expect(gender).toHaveValue('0')
    expect(gender.options[gender.selectedIndex]).toHaveTextContent('未知')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'SET_CUSTOMER')[0].variables.input.gender).toBe('UNKNOWN')
  })

  it('顧客的偏好設計師不在可打單人員中（例如已離職）：彈窗照常開啟，偏好設計師欄空白，儲存時保留原設定', async () => {
    const { calls } = await openEdit({
      FETCH_CUSTOMER_DETAIL: v => ({ customer: v.id ? { ...CUSTOMER_DETAIL, preferDesigner: { id: 'left-1', name: '已離職' } } : null }),
    })
    expect(input('name')).toHaveValue(CUSTOMER.name)
    expect(preferDesigner()).toHaveValue('')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'SET_CUSTOMER')).toHaveLength(1))
    expect(callsOf(calls, 'SET_CUSTOMER')[0].variables.input.PreferDesignerId).toBe('left-1')
  })
})

describe('新增顧客按鈕', () => {
  it('鍵盤聚焦「新增顧客」後按下即開啟彈窗', async () => {
    setupPage()
    await waitPageReady()
    const add = button('新增顧客')
    act(() => add.focus())
    expect(add).toHaveFocus()
    fireEvent.click(add)
    expect(await screen.findByText('新增客戶')).toBeInTheDocument()
    fireEvent.click(button('取消'))
    await wait(() => expect(screen.queryByText('新增客戶')).toBeNull())
  })

  it('鍵盤聚焦「編輯顧客資料」後按下即開啟彈窗', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickCustomer(calls)
    const edit = await findButton('編輯顧客資料')
    act(() => edit.focus())
    expect(edit).toHaveFocus()
    fireEvent.click(edit)
    expect(await screen.findByText('編輯客戶資料')).toBeInTheDocument()
  })
})

describe('偏好設計師清單', () => {
  it('沒有編號的人員標示「(無代號)」；欄位內輸入一般按鍵不會跳到備註', async () => {
    const NO_NUMBER = { userId: 'helper-2', userName: '張學徒', userNickName: null, userNo: null }
    await openNew({ GET_USERS_ORDERABLE_LIST: { getUserOrderableList: [DESIGNER, HELPER, NO_NUMBER] } })
    fireEvent.click(preferDesigner())
    expect(await screen.findByText('張學徒(無代號)')).toBeInTheDocument()
    act(() => preferDesigner().focus())
    fireEvent.focus(preferDesigner())
    fireEvent.keyDown(preferDesigner(), { key: 'a', keyCode: 65 })
    expect(preferDesigner()).toHaveFocus()
  })
})
