// 保護「重新開單」服務列的鍵盤操作（櫃檯以 Enter 一路往下填，不用滑鼠）：
// 服務項目 → 價格（鎖價服務跳過價格）→ 助理 →（店家開「助理指定」時）指定勾選 →（店家開第三方卡券且卡券沒被鎖定時）第三方卡券 → 下一列服務項目；
// 最後一列再按 Enter 自動新增一列。其他按鍵不移動焦點。這個順序錯了，櫃檯就會把資料填到錯的欄位。
// GraphQL 全由 testkit 的模擬 link 回應，不連後端、不建立真實帳單。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { loginAs } from '../../../__tests__/testkit.test'
import { setupQueue, loaded, baseQueue, pickOption, inputOf, servicesPage, SERVICE, SERVICE_DYE } from './queueKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => loginAs())
afterEach(cleanup)

// 價格可改、但綁定的第三方卡券被鎖定的服務
const SERVICE_TP = {
  ...SERVICE,
  id: 'service-3',
  no: 'S03',
  name: '團購剪髮',
  bindedThirdPartTicket: { id: 'tp-1' },
  isBindedThirdPartTicketLocked: 'TRUE',
}
// 價格依店家設定鎖定（UNSET）、第三方卡券不鎖定的服務
const SERVICE_PERM = { ...SERVICE, id: 'service-4', no: 'S04', name: '燙髮', price: 3000, isLocked: 'UNSET' }
// 鎖價、第三方卡券不鎖定的服務
const SERVICE_LOCKED = { ...SERVICE, id: 'service-5', no: 'S05', name: '頭皮護理', price: 1500, isLocked: 'TRUE' }
const ALL = [SERVICE, SERVICE_DYE, SERVICE_TP, SERVICE_PERM, SERVICE_LOCKED]
const TWO_HELPERS = [{ type: '助理', nameList: ['洗髮', '吹整'], helperDeductionType: 'FIXED' }]

const options = ({ helpersFor = [], designation = false, thirdParty = false } = {}) => ({
  // 佇列帳單沒有服務：從第一列開始用自動完成選
  queue: baseQueue({ serviceOrders: [] }),
  FETCH_SERVICES: servicesPage(ALL.map(s => ({ ...s, isUsing: true }))),
  GET_SERVICES_FOR_AUTOCOMPLETE: servicesPage(ALL),
  service: ({ serviceId }) => ({ service: { helperDeductionSetting: helpersFor.includes(serviceId) ? TWO_HELPERS : [] } }),
  GET_HELPER_DESIGNATION_DISPLAY: { getIsHelperDesignationDisplay: designation },
  GET_THIRD_PART_DISPLAY: { getIsThirdPartTicketDisplay: thirdParty },
})

const serviceInput = index => inputOf(screen.getByTestId(`service-${index}`))
const priceInput = index => inputOf(screen.getByTestId(`service-${index}-price`))
const thirdPartyInput = index => inputOf(screen.getByTestId(`service-${index}-thirdParty`))
const helper = name => screen.getByPlaceholderText(`助理-${name}`)
const designateOf = name => document.querySelector(`input[name="助理-${name}designate"]`)
const enter = el => fireEvent.keyDown(el, { key: 'Enter', keyCode: 13 })
const focused = el => wait(() => expect(document.activeElement).toBe(el))

const choose = async (index, service) => {
  await pickOption(serviceInput(index), `${service.name}(${service.no}) - ${service.price}`)
  await wait(() => expect(serviceInput(index)).toHaveValue(`${service.name}(${service.no})`))
}

describe('重新開單：服務列的 Enter 順序（沒有助理）', () => {
  it('服務項目 → 價格（選取整個數字）→ 最後一列自動新增下一列並跳到服務項目；其他按鍵不移動', async () => {
    const page = setupQueue(options())
    await loaded(page)
    await choose(0, SERVICE)
    fireEvent.keyDown(serviceInput(0), { key: 'a' })
    enter(serviceInput(0))
    await focused(priceInput(0))
    fireEvent.focusIn(priceInput(0))
    expect(priceInput(0).selectionStart).toBe(0)
    expect(priceInput(0).selectionEnd).toBe('800'.length)
    fireEvent.keyDown(priceInput(0), { key: 'a' })
    expect(document.activeElement).toBe(priceInput(0))
    enter(priceInput(0))
    await focused(serviceInput(1))
    // 空白列按 Enter 不動作
    enter(serviceInput(1))
    expect(document.activeElement).toBe(serviceInput(1))
  })

  it('店家開助理指定與第三方卡券：價格 → 第三方卡券 → 下一列；卡券被鎖定時價格直接跳下一列', async () => {
    const page = setupQueue(options({ designation: true, thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE)
    enter(serviceInput(0))
    await focused(priceInput(0))
    enter(priceInput(0))
    await focused(thirdPartyInput(0))
    fireEvent.keyDown(thirdPartyInput(0), { key: 'a' })
    enter(thirdPartyInput(0))
    await wait(() => expect(screen.getByTestId('service-1')).toBeInTheDocument())
    await choose(1, SERVICE_TP)
    enter(serviceInput(1))
    await focused(priceInput(1))
    enter(priceInput(1))
    await focused(serviceInput(2))
    // 非最後一列的第三方卡券按 Enter：跳到下一列服務項目
    fireEvent.focusIn(thirdPartyInput(0))
    enter(thirdPartyInput(0))
    await focused(serviceInput(1))
  })

  it('沒開助理指定、有第三方卡券：價格 → 第三方卡券；卡券被鎖定時跳下一列', async () => {
    const page = setupQueue(options({ thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE)
    enter(serviceInput(0))
    await focused(priceInput(0))
    enter(priceInput(0))
    await focused(thirdPartyInput(0))
    fireEvent.click(screen.getByTestId('service-0-add'))
    await choose(1, SERVICE_TP)
    enter(serviceInput(1))
    await focused(priceInput(1))
    enter(priceInput(1))
    await focused(serviceInput(2))
  })

  it('開助理指定、沒有第三方卡券：價格直接跳下一列', async () => {
    const page = setupQueue(options({ designation: true }))
    await loaded(page)
    await choose(0, SERVICE)
    enter(serviceInput(0))
    await focused(priceInput(0))
    enter(priceInput(0))
    await focused(serviceInput(1))
  })
})

describe('重新開單：鎖價服務的 Enter 順序（跳過價格）', () => {
  it('有助理：服務項目 → 第一個助理', async () => {
    const page = setupQueue(options({ helpersFor: [SERVICE_DYE.id] }))
    await loaded(page)
    await choose(0, SERVICE_DYE)
    await wait(() => expect(helper('洗髮')).toBeInTheDocument())
    expect(priceInput(0)).toBeDisabled()
    enter(serviceInput(0))
    await focused(helper('洗髮'))
  })

  it('沒有助理、卡券被鎖定：服務項目 → 下一列', async () => {
    const page = setupQueue(options({ thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE_DYE)
    enter(serviceInput(0))
    await focused(serviceInput(1))
  })

  it('沒有助理、卡券可選：服務項目 → 第三方卡券；沒開第三方卡券時 → 下一列', async () => {
    const page = setupQueue(options({ thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE_PERM)
    expect(priceInput(0)).toBeDisabled()
    enter(serviceInput(0))
    await focused(thirdPartyInput(0))
    cleanup()
    const plain = setupQueue(options())
    await loaded(plain)
    await choose(0, SERVICE_PERM)
    enter(serviceInput(0))
    await focused(serviceInput(1))
  })
})

describe('重新開單：刪除正在輸入價格的列', () => {
  it('遞補上來的是鎖價服務：焦點移到該列的第三方卡券（價格不能改）', async () => {
    const page = setupQueue(options({ thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE)
    fireEvent.click(screen.getByTestId('service-0-add'))
    await choose(1, SERVICE)
    fireEvent.click(screen.getByTestId('service-1-add'))
    await choose(2, SERVICE_LOCKED)
    fireEvent.focusIn(priceInput(1))
    fireEvent.click(screen.getByTestId('service-1-delete'))
    await wait(() => expect(serviceInput(1)).toHaveValue('頭皮護理(S05)'))
    await focused(thirdPartyInput(1))
  })
})

describe('重新開單：助理欄的 Enter 順序', () => {
  it('開助理指定與第三方卡券：價格 → 助理 → 指定 → 下一個助理 → 指定 → 第三方卡券', async () => {
    const page = setupQueue(options({ helpersFor: [SERVICE.id], designation: true, thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(priceInput(0))
    await focused(helper('洗髮'))
    fireEvent.keyDown(helper('洗髮'), { key: 'a' })
    enter(helper('洗髮'))
    await focused(designateOf('洗髮'))
    fireEvent.keyDown(designateOf('洗髮'), { key: 'a' })
    enter(designateOf('洗髮'))
    await focused(helper('吹整'))
    enter(helper('吹整'))
    await focused(designateOf('吹整'))
    enter(designateOf('吹整'))
    await focused(thirdPartyInput(0))
  })

  it('開助理指定、卡券被鎖定：最後一個指定 → 下一列；沒開第三方卡券時同樣跳下一列', async () => {
    const page = setupQueue(options({ helpersFor: [SERVICE_TP.id], designation: true, thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE_TP)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(designateOf('吹整'))
    await focused(serviceInput(1))
    cleanup()
    const plain = setupQueue(options({ helpersFor: [SERVICE.id], designation: true }))
    await loaded(plain)
    await choose(0, SERVICE)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(designateOf('吹整'))
    await focused(serviceInput(1))
  })

  it('沒開助理指定：助理 → 下一個助理 → 第三方卡券；卡券被鎖定時 → 下一列', async () => {
    const page = setupQueue(options({ helpersFor: [SERVICE.id, SERVICE_TP.id], thirdParty: true }))
    await loaded(page)
    await choose(0, SERVICE)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(helper('洗髮'))
    await focused(helper('吹整'))
    enter(helper('吹整'))
    await focused(thirdPartyInput(0))
    cleanup()
    const locked = setupQueue(options({ helpersFor: [SERVICE_TP.id], thirdParty: true }))
    await loaded(locked)
    await choose(0, SERVICE_TP)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(helper('吹整'))
    await focused(serviceInput(1))
  })

  it('沒開助理指定與第三方卡券：最後一個助理 → 下一列', async () => {
    const page = setupQueue(options({ helpersFor: [SERVICE.id] }))
    await loaded(page)
    await choose(0, SERVICE)
    await wait(() => expect(helper('吹整')).toBeInTheDocument())
    enter(helper('吹整'))
    await focused(serviceInput(1))
  })
})
