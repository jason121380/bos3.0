// 保護「編輯會員卡」：帶入原會員卡（可販售才帶售價與抽成方式；不販售售價為 0）；儲存時有效天數轉整數、價格轉數字，
// 鎖價、顏色、說明照送；關閉販售時抽成清回固定 0；有效天數不得為負；「儲存並上一筆／下一筆」依會員卡清單順序跳到相鄰的卡，
// 第一筆／最後一筆時對應按鈕停用；必填（代號、名稱、類別）缺一不能儲存；失敗提示錯誤。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, typeLikeBrowser } from '../../../__tests__/testkit.test'
import { fieldByLabel, pickOption, selectedText, stubLocation } from '../../__tests__/settingsPageKit.test'
import MemberCardEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const CATEGORIES = [
  { uuid: 'cat-1', no: 'A01', name: '儲值卡' },
  { uuid: 'cat-2', no: 'A02', name: '年卡' },
]
const card = overrides => ({
  uuid: 'm1',
  no: 'M01',
  name: '萬元儲值卡',
  membershipCategory: { id: '1', uuid: 'cat-1', name: '儲值卡' },
  cost: 1000,
  sellPrice: 10000,
  employeePrice: 8000,
  commissionWay: 'byCost',
  commission: 5,
  isAvailableForSale: true,
  isLocked: 'TRUE',
  effecitveDay: 365,
  image: 'https://img.example/c.png',
  color: '#112233',
  textColor: '#FFFFFF',
  comment: '一年有效',
  ...overrides,
})
const LIST = [{ uuid: 'm0' }, { uuid: 'm1' }, { uuid: 'm2' }]
const setup = ({ membership = card(), list = LIST, ...fixtures } = {}) =>
  renderPage(<MemberCardEdit match={{ params: { id: membership ? membership.uuid : 'm1' } }} />, {
    fixtures: {
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: CATEGORIES },
      FETCH_MEMBERSHIP: { membership },
      FETCH_MEMBERSHIPS: { memberships: { data: list } },
      updateMembership: { updateMembership: true },
      ...fixtures,
    },
    route: '/member-card/edit/m1',
  })
const button = text => screen.getByText(text).closest('button')
const sentInput = (calls, i = 0) => callsOf(calls, 'updateMembership')[i].variables.input
// 欄位的 onChange 在 produce 的 updater 裡才讀 event.target，必須用與瀏覽器相同的方式輸入（見 testkit typeLikeBrowser）；
// 販售開關同理，以不包 act 的原生 click 切換
const toggleSale = () => screen.getByRole('switch').click()
const loaded = () => wait(() => expect(fieldByLabel('名稱')).toHaveValue('萬元儲值卡'))

let restoreLocation
beforeEach(() => {
  loginAs()
  restoreLocation = stubLocation()
})
afterEach(() => {
  cleanup()
  restoreLocation()
})

describe('編輯會員卡', () => {
  it('帶入可販售會員卡的資料（售價、抽成方式、鎖價、顏色）；以 uuid 查詢', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'FETCH_MEMBERSHIP')[0].variables).toEqual({ membershipUUID: 'm1' })
    expect(fieldByLabel('代號')).toHaveValue('M01')
    expect(selectedText(fieldByLabel('會員卡類別'))).toBe('A01 / 儲值卡')
    expect(fieldByLabel('有效天數')).toHaveValue(365)
    expect(fieldByLabel('會員卡售價')).toHaveValue(10000)
    expect(selectedText(fieldByLabel('抽成方式'))).toBe('依售價-成本(%)')
    expect(fieldByLabel('抽成數字%')).toHaveValue(5)
    expect(selectedText(fieldByLabel('打帳單是否能更改預設價格'))).toBe('不可更改')
    expect(fieldByLabel('會員卡的顏色')).toHaveValue('#112233')
    expect(fieldByLabel('會籍說明')).toHaveValue('一年有效')
  })

  it('儲存：有效天數轉整數、價格轉數字，其他欄位照送，成功導回會員卡列表', async () => {
    const { calls } = setup()
    await loaded()
    typeLikeBrowser(fieldByLabel('代號'), 'M09')
    pickOption(fieldByLabel('會員卡類別'), 'A02 / 年卡')
    typeLikeBrowser(fieldByLabel('有效天數'), '180')
    typeLikeBrowser(fieldByLabel('會員卡售價'), '9000.5')
    typeLikeBrowser(fieldByLabel('成本價格'), '900')
    typeLikeBrowser(fieldByLabel('員工自購價格'), '7000')
    pickOption(fieldByLabel('抽成方式'), '固定金額')
    typeLikeBrowser(fieldByLabel('抽成數字'), '300')
    pickOption(fieldByLabel('打帳單是否能更改預設價格'), '依系統參數設定')
    typeLikeBrowser(fieldByLabel('圖片'), 'https://img.example/new.png')
    typeLikeBrowser(fieldByLabel('會籍說明'), '半年有效')
    fireEvent.change(fieldByLabel('會員卡的顏色'), { target: { value: '#000000' } })
    fireEvent.change(fieldByLabel('會員卡文字的顏色'), { target: { value: '#FFD700' } })
    document.querySelectorAll('input[type="number"]').forEach(input => fireEvent.wheel(input))
    fireEvent.click(button('儲存'))
    await wait(() => expect(currentLocation()).toBe('/member-card-record'))
    expect(sentInput(calls)).toEqual({
      itemUUID: 'm1',
      no: 'M09',
      name: '萬元儲值卡',
      cost: 900,
      sellPrice: 9000.5,
      employeePrice: 7000,
      commission: 300,
      MembershipCategoryUUID: 'cat-2',
      isAvailableForSale: true,
      isLocked: 'UNSET',
      color: '#000000',
      effecitveDay: 180,
      commissionWay: 'fixed',
      textColor: '#FFD700',
      image: 'https://img.example/new.png',
      comment: '半年有效',
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功更新會員卡', variant: 'success' })
  })

  it('不販售的會員卡：售價帶 0、抽成方式維持固定、不顯示抽成；沒有顏色時欄位為空', async () => {
    const { calls } = setup({ membership: card({ isAvailableForSale: false, sellPrice: 500, commissionWay: 'byPrice', color: null }) })
    await loaded()
    expect(screen.queryByText('會員卡售價')).toBeNull()
    expect(screen.queryByText('抽成方式')).toBeNull()
    expect(fieldByLabel('會員卡的顏色')).toHaveValue('')
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'updateMembership')).toHaveLength(1))
    expect(sentInput(calls)).toEqual(
      expect.objectContaining({ isAvailableForSale: false, sellPrice: 0, commissionWay: 'fixed', commission: 5, color: '' })
    )
  })

  it('開關販售：打開出現售價與抽成；關掉時抽成清回固定 0', async () => {
    const { calls } = setup()
    await loaded()
    toggleSale()
    await wait(() => expect(screen.queryByText('抽成方式')).toBeNull())
    toggleSale()
    await wait(() => expect(selectedText(fieldByLabel('抽成方式'))).toBe('固定金額'))
    expect(fieldByLabel('抽成數字')).toHaveValue(0)
    toggleSale()
    fireEvent.click(button('儲存'))
    await wait(() => expect(callsOf(calls, 'updateMembership')).toHaveLength(1))
    expect(sentInput(calls)).toEqual(expect.objectContaining({ isAvailableForSale: false, commission: 0, commissionWay: 'fixed' }))
  })

  it('儲存並上一筆／下一筆：依清單順序跳到相鄰的會員卡', async () => {
    const { calls } = setup()
    await loaded()
    await wait(() => expect(button('儲存並上一筆')).toBeEnabled())
    fireEvent.click(button('儲存並上一筆'))
    await wait(() => expect(window.location.href).toBe('/member-card/edit/m0'))
    fireEvent.click(button('儲存並下一筆'))
    await wait(() => expect(window.location.href).toBe('/member-card/edit/m2'))
    expect(callsOf(calls, 'updateMembership')).toHaveLength(2)
    expect(sentInput(calls, 1).itemUUID).toBe('m1')
  })

  it('第一筆時「上一筆」停用、最後一筆時「下一筆」停用', async () => {
    setup({ list: [{ uuid: 'm1' }, { uuid: 'm2' }] })
    await loaded()
    await wait(() => expect(button('儲存並下一筆')).toBeEnabled())
    expect(button('儲存並上一筆')).toBeDisabled()
    cleanup()
    setup({ list: [{ uuid: 'm0' }, { uuid: 'm1' }] })
    await loaded()
    await wait(() => expect(button('儲存並上一筆')).toBeEnabled())
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it('名稱清空時三個儲存鈕都停用', async () => {
    setup()
    await loaded()
    typeLikeBrowser(fieldByLabel('名稱'), '')
    expect(button('儲存')).toBeDisabled()
    expect(button('儲存並上一筆')).toBeDisabled()
    expect(button('儲存並下一筆')).toBeDisabled()
  })

  it.each(['儲存', '儲存並上一筆', '儲存並下一筆'])('「%s」：有效天數為負時提示錯誤、不送出', async label => {
    const { calls } = setup()
    await loaded()
    await wait(() => expect(button('儲存並上一筆')).toBeEnabled())
    typeLikeBrowser(fieldByLabel('有效天數'), '-3')
    fireEvent.click(button(label))
    expect(openSnackbar).toHaveBeenCalledWith({ message: '請輸入有效期限大於或等於0', variant: 'error' })
    await new Promise(resolve => setTimeout(resolve, 30))
    expect(callsOf(calls, 'updateMembership')).toHaveLength(0)
  })

  it.each(['儲存', '儲存並上一筆', '儲存並下一筆'])('「%s」：送出失敗時提示錯誤、不跳頁', async label => {
    setup({ updateMembership: new Error('會員卡已停用') })
    await loaded()
    await wait(() => expect(button('儲存並上一筆')).toBeEnabled())
    fireEvent.click(button(label))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '會員卡已停用', variant: 'error' }))
    expect(window.location.href).toBe('http://localhost/')
    expect(currentLocation()).toBe('/member-card/edit/m1')
  })

  it('色票：卡片底色與文字色各自選色後填入並關閉', async () => {
    setup()
    await loaded()
    fireEvent.click(screen.getByLabelText('選擇會員卡的顏色'))
    fireEvent.click(document.querySelector('[title="#f44336"]'))
    expect(fieldByLabel('會員卡的顏色')).toHaveValue('#f44336')
    fireEvent.click(screen.getByLabelText('選擇會員卡文字的顏色'))
    fireEvent.click(document.querySelector('[title="#2196f3"]'))
    expect(fieldByLabel('會員卡文字的顏色')).toHaveValue('#2196f3')
    expect(document.querySelector('[title="#2196f3"]')).toBeNull()
  })
})
