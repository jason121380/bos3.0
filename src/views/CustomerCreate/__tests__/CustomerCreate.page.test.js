// 保護「新增客戶」：顯示最新顧客編號；手機未填不可新增；顧客編號輸入後 500ms 查詢是否重複（重複顯示「客戶編號重複」）；
// 生日以民國年（最多 3 碼）／月（≤ 12）／日（≤ 31）輸入；送出的 input（編號、姓名、暱稱、手機、生日物件、性別、Email、地址、
// LINE ID、偏好設計師、來源、備註、目前店家）正確，成功導回客戶列表，失敗提示並可再按。
// 個資欄位（手機、生日）原樣送出、不被其他欄位覆蓋。GraphQL 全由 testkit 的模擬 link 回應，不建立真實顧客。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser, MERCHANT_ID } from '../../../__tests__/testkit.test'
import CustomerCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const setup = (fixtures = {}) =>
  renderPage(<CustomerCreate />, {
    fixtures: {
      GET_LAST_CUSTOMER_NO: { getLastCustomerNo: 'C099' },
      FETCH_DESIGNERS: {
        merchantDesigners: [
          { id: 'd1', name: '王小美' },
          { id: 'd2', name: 'Amy' },
        ],
      },
      GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] },
      GET_CHECK_IS_CUSTOMER_NO_USED: { checkIsCustomerNoUsed: false },
      FETCH_ADD_CUSTOMER: { addCustomer: { id: 'new-1' } },
      ...fixtures,
    },
    route: '/management/customer/create',
  })

// 受控欄位在 produce 的 updater 內才讀 event.target.value：以 typeLikeBrowser 輸入（見 testkit 說明）
const fieldInput = label => screen.getByText(label).parentElement.querySelector('input')
const inputOf = label => screen.getAllByLabelText(label).find(el => el.tagName === 'INPUT')
const choose = (select, text) => {
  const option = Array.from(select.querySelectorAll('option')).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const addButtons = () =>
  screen
    .getAllByText('新增')
    .map(el => el.closest('button'))
    .filter(Boolean)

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('新增客戶', () => {
  it('顯示最新顧客編號；手機未填時兩個新增鈕都不可按', async () => {
    const utils = setup()
    await utils.settle()
    expect(screen.getByText('最新顧客編號: C099')).toBeInTheDocument()
    expect(addButtons()).toHaveLength(2)
    addButtons().forEach(b => expect(b).toBeDisabled())
    // 停用原因只顯示一次，兩顆新增鈕都指向同一句（STYLE.md §6）
    const reason = screen.getByText('尚缺：手機')
    expect(reason).toHaveAttribute('role', 'status')
    addButtons().forEach(b => expect(b).toHaveAttribute('aria-describedby', reason.id))
    typeLikeBrowser(inputOf('手機'), '0912345678')
    addButtons().forEach(b => expect(b).not.toBeDisabled())
    expect(screen.queryByText(/^尚缺：/)).toBeNull()
  })

  it('顧客編號：輸入後查詢是否重複，重複顯示錯誤；未重複顯示通過；清空不查詢', async () => {
    const utils = setup({ GET_CHECK_IS_CUSTOMER_NO_USED: v => ({ checkIsCustomerNoUsed: v.input === 'C001' }) })
    await utils.settle()
    typeLikeBrowser(inputOf('代號'), 'C001')
    expect(await screen.findByText('客戶編號重複', {}, { timeout: 12000 })).toBeInTheDocument()
    expect(callsOf(utils.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED')[0].variables).toEqual({ input: 'C001' })
    typeLikeBrowser(inputOf('代號'), 'C100')
    await wait(() => expect(screen.queryByText('客戶編號重複')).toBeNull(), { timeout: 12000 })
    await wait(() => expect(callsOf(utils.calls, 'GET_CHECK_IS_CUSTOMER_NO_USED').pop().variables).toEqual({ input: 'C100' }), { timeout: 12000 })
    typeLikeBrowser(inputOf('代號'), '')
    await utils.settle()
    expect(screen.queryByText('客戶編號重複')).toBeNull()
  })

  it('生日：民國年最多 3 碼、月不超過 12、日不超過 31，可清空', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.change(inputOf('民國年'), { target: { value: '0791' } })
    expect(inputOf('民國年')).toHaveValue('')
    fireEvent.change(inputOf('民國年'), { target: { value: '79' } })
    fireEvent.change(inputOf('月'), { target: { value: '13' } })
    expect(inputOf('月')).toHaveValue('')
    fireEvent.change(inputOf('月'), { target: { value: '2' } })
    fireEvent.change(inputOf('月'), { target: { value: '' } })
    fireEvent.change(inputOf('月'), { target: { value: '12' } })
    fireEvent.change(inputOf('日'), { target: { value: '32' } })
    expect(inputOf('日')).toHaveValue('')
    fireEvent.change(inputOf('日'), { target: { value: '31' } })
    fireEvent.change(inputOf('日'), { target: { value: '' } })
    fireEvent.change(inputOf('日'), { target: { value: '5' } })
    expect(inputOf('民國年')).toHaveValue('79')
    expect(inputOf('月')).toHaveValue('12')
    expect(inputOf('日')).toHaveValue('5')
  })

  it('填寫全部欄位送出：input 內容正確，成功提示並導回客戶列表', async () => {
    const utils = setup()
    await utils.settle()
    typeLikeBrowser(inputOf('代號'), 'C100')
    typeLikeBrowser(fieldInput('姓名'), '陳小姐')
    typeLikeBrowser(fieldInput('暱稱'), '小陳')
    typeLikeBrowser(inputOf('手機'), '0912345678')
    fireEvent.change(inputOf('民國年'), { target: { value: '79' } })
    fireEvent.change(inputOf('月'), { target: { value: '2' } })
    fireEvent.change(inputOf('日'), { target: { value: '28' } })
    typeLikeBrowser(fieldInput('Email'), 'chen@example.com')
    typeLikeBrowser(fieldInput('聯絡地址'), '台北市')
    fireEvent.click(screen.getByText('女'))
    typeLikeBrowser(fieldInput('LINE ID'), 'chen01')
    choose(screen.getByLabelText('設計師'), '王小美')
    choose(screen.getByLabelText('客戶來源'), '網路')
    typeLikeBrowser(fieldInput('備註'), '怕冷')
    fireEvent.click(addButtons()[1])
    // 送出中兩個新增鈕都鎖住（卡片右上角的「新增」原本只看手機是否有填，送出中仍可再按；Jason 2026/10/22 fix all）
    expect(addButtons()[1]).toBeDisabled()
    expect(addButtons()[0]).toBeDisabled()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增客戶', variant: 'success' }))
    expect(callsOf(utils.calls, 'FETCH_ADD_CUSTOMER')[0].variables).toEqual({
      input: {
        category: '',
        no: 'C100',
        name: '陳小姐',
        nickName: '小陳',
        cellphone: '0912345678',
        birthday: { year: '79', month: '2', day: '28' },
        PreferDesignerId: 'd1',
        OfficialBrandMerchantId: MERCHANT_ID,
        email: 'chen@example.com',
        address: '台北市',
        gender: 'FEMALE',
        lineId: 'chen01',
        source: '網路',
        remark: '怕冷',
      },
    })
    await wait(() => expect(currentLocation()).toBe('/management/customers'))
  })

  // 性別再按一次已選的選項時 ToggleGroup 回傳 null：比照成為會員頁忽略，維持原選擇（原本送出 gender: null；Jason 2026/10/22 fix all）
  it('再按一次已選的性別維持原選擇；連按右上角新增只建立一次；沒有選定店家時店家 id 為 null', async () => {
    loginAs({ merchant: null })
    const utils = setup()
    await utils.settle()
    typeLikeBrowser(inputOf('手機'), '0912345678')
    fireEvent.click(screen.getByText('男'))
    expect(screen.getByText('男').closest('button')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(addButtons()[0])
    fireEvent.click(addButtons()[0])
    await wait(() => expect(callsOf(utils.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1))
    await utils.settle()
    expect(callsOf(utils.calls, 'FETCH_ADD_CUSTOMER')).toHaveLength(1)
    expect(callsOf(utils.calls, 'FETCH_ADD_CUSTOMER')[0].variables.input).toMatchObject({
      gender: 'MALE',
      OfficialBrandMerchantId: null,
      birthday: { year: '', month: '', day: '' },
    })
  })

  it('新增失敗：以錯誤訊息提示、按鈕恢復可按、不導頁', async () => {
    const utils = setup({ FETCH_ADD_CUSTOMER: new Error('手機已存在') })
    await utils.settle()
    typeLikeBrowser(inputOf('手機'), '0912345678')
    fireEvent.click(addButtons()[1])
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '手機已存在', variant: 'error' }))
    addButtons().forEach(b => expect(b).not.toBeDisabled())
    expect(currentLocation()).toBe('/management/customer/create')
  })
})
