// 保護顧客詳細「顧客追蹤」（髮況）分頁：各項髮況以「、」串接、染髮配方保留換行；編輯彈窗開啟時才查店家的髮況選項，
// 從選項挑選／取消、刪除標籤、改染髮配方後確認，送出 { ...髮況, customerId }，成功提示並重新查詢髮況，後端回 false 或錯誤時提示且確認鈕恢復可按；
// 店家沒有該類選項時顯示無資料。GraphQL 全由 testkit 的模擬 link 回應，不寫入真實資料。
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { renderDetails, baseFixtures } from './detailsKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const ROUTE = '/management/customers/c1/customerTracking'
const HAIR = baseFixtures().GET_CUSTOMER_HAIR_INFO.getCustomerHairInfo
const MERCHANT_OPTIONS = {
  getMerchantHairCondition: {
    hairProperties: ['細軟', '受損', '粗硬'],
    scalpProperties: [],
    permAppliance: ['冷燙'],
    permPotion: [],
    hairColorCategory: [],
    hairColor: ['霧棕'],
  },
}
const setup = (fixtures = {}, options = {}) =>
  renderDetails({
    route: ROUTE,
    fixtures: { GET_MERCHANT_HAIR_CONDITION: MERCHANT_OPTIONS, SET_CUSTOMER_HAIR_INFO: { setCustomerHairInfo: true }, ...fixtures },
    ...options,
  })

const value = title => screen.getByText(`${title}：`).nextSibling
const dialog = () => screen.getByText('編輯顧客髮況').closest('[role="dialog"]')
const editOption = index => within(dialog()).getAllByLabelText('編輯選項')[index]

beforeEach(() => {
  loginAs()
  openSnackbar.mockClear()
})
afterEach(cleanup)

describe('顧客追蹤', () => {
  it('顯示各項髮況（以「、」串接，沒有則空白）與染髮配方', async () => {
    const utils = setup()
    await utils.settle()
    expect(value('髮質屬性')).toHaveTextContent('細軟、受損')
    expect(value('頭皮屬性').textContent).toBe('')
    expect(value('燙髮用具')).toHaveTextContent('冷燙')
    expect(value('染髮色系')).toHaveTextContent('霧棕')
    expect(value('染髮配方').textContent).toBe('6/0 + 7/1\n雙氧 6%')
    // 開啟編輯前不查店家選項
    expect(callsOf(utils.calls, 'GET_MERCHANT_HAIR_CONDITION')).toHaveLength(0)
  })

  it('髮況載入中以空白顯示（不壞頁）', async () => {
    setup({}, { delays: { GET_CUSTOMER_HAIR_INFO: 3000 } })
    await screen.findByText('髮質屬性：')
    expect(value('髮質屬性').textContent).toBe('')
  })

  it('編輯：挑選／取消選項、刪除標籤、改配方後確認，送出內容正確並重新查詢髮況', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('編輯'))
    await wait(() => expect(callsOf(utils.calls, 'GET_MERCHANT_HAIR_CONDITION')).toHaveLength(1))
    await wait(() => expect(editOption(0)).not.toBeDisabled())
    // 髮質屬性：加「粗硬」、取消「受損」
    fireEvent.click(editOption(0))
    const picker = screen.getByText('選擇髮質屬性').closest('[role="dialog"]')
    fireEvent.click(within(picker).getByText('粗硬'))
    fireEvent.click(within(picker).getByText('受損'))
    fireEvent.click(within(picker).getByText('確認'))
    await wait(() => expect(screen.queryByText('選擇髮質屬性')).toBeNull())
    // 燙髮用具：刪除「冷燙」標籤
    fireEvent.keyUp(within(dialog()).getByText('冷燙').closest('[role="button"]'), { key: 'Delete' })
    expect(within(dialog()).queryByText('冷燙')).toBeNull()
    fireEvent.change(within(dialog()).getByLabelText('染髮配方'), { target: { value: '7/1' } })
    const before = callsOf(utils.calls, 'GET_CUSTOMER_HAIR_INFO').length
    fireEvent.click(within(dialog()).getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯成功', variant: 'success' }))
    expect(callsOf(utils.calls, 'SET_CUSTOMER_HAIR_INFO')[0].variables).toEqual({
      input: { ...HAIR, hairProperties: ['細軟', '粗硬'], permAppliance: [], hairDyeFormula: '7/1', customerId: 'c1' },
    })
    await wait(() => expect(callsOf(utils.calls, 'GET_CUSTOMER_HAIR_INFO').length).toBeGreaterThan(before))
    await wait(() => expect(screen.queryByText('編輯顧客髮況')).toBeNull())
  })

  it('選項彈窗按關閉不套用；店家沒有該類選項顯示無資料；編輯彈窗按關閉不送出', async () => {
    const utils = setup()
    await utils.settle()
    fireEvent.click(screen.getByText('編輯'))
    await wait(() => expect(editOption(0)).not.toBeDisabled())
    fireEvent.click(editOption(0))
    const picker = screen.getByText('選擇髮質屬性').closest('[role="dialog"]')
    fireEvent.click(within(picker).getByText('粗硬'))
    fireEvent.click(within(picker).getByText('關閉'))
    await wait(() => expect(screen.queryByText('選擇髮質屬性')).toBeNull())
    expect(within(dialog()).queryByText('粗硬')).toBeNull()
    fireEvent.click(editOption(1))
    expect(within(screen.getByText('選擇頭皮屬性').closest('[role="dialog"]')).getByText('無資料')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByText('選擇頭皮屬性'), { key: 'Escape' })
    await wait(() => expect(screen.queryByText('選擇頭皮屬性')).toBeNull())
    fireEvent.click(within(dialog()).getByText('關閉'))
    await wait(() => expect(screen.queryByText('編輯顧客髮況')).toBeNull())
    expect(callsOf(utils.calls, 'SET_CUSTOMER_HAIR_INFO')).toHaveLength(0)
    fireEvent.click(screen.getByText('編輯'))
    await screen.findByText('編輯顧客髮況')
    fireEvent.keyDown(dialog(), { key: 'Escape' })
    await wait(() => expect(screen.queryByText('編輯顧客髮況')).toBeNull())
  })

  it('後端回 false：提示編輯失敗、確認鈕恢復；錯誤以訊息提示', async () => {
    const utils = setup({ SET_CUSTOMER_HAIR_INFO: { setCustomerHairInfo: false } })
    await utils.settle()
    fireEvent.click(screen.getByText('編輯'))
    await screen.findByText('編輯顧客髮況')
    fireEvent.click(within(dialog()).getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯失敗', variant: 'error' }))
    expect(within(dialog()).getByText('確認')).not.toBeDisabled()
    cleanup()
    const errored = setup({ SET_CUSTOMER_HAIR_INFO: new Error('沒有權限') })
    await errored.settle()
    fireEvent.click(screen.getByText('編輯'))
    await screen.findByText('編輯顧客髮況')
    fireEvent.click(within(dialog()).getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '沒有權限', variant: 'error' }))
    expect(within(dialog()).getByText('確認')).not.toBeDisabled()
  })

  // 已知缺口（待 Jason 決定）：髮況查詢失敗（或顧客沒有髮況資料回 null）時，顯示區直接讀 hairCondition[key].length 拋錯，整頁進入錯誤畫面
  // （views/CustomerManagementDetails/CustomerTracking/index.js:23、37；index.js:311）。建議：沒有資料時以空髮況顯示。
  it('已知缺口：髮況查詢失敗時整頁進入錯誤畫面', async () => {
    const utils = setup({ GET_CUSTOMER_HAIR_INFO: new Error('查詢失敗') })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
