// 保護「編輯組合設定」：依網址 id 帶入代號、名稱與已選的服務／店販／預收卡／會員卡（會員卡以 uuid 對應）；
// 儲存送出 id 與新內容；刪除要在確認視窗按確認、送出組合 id 後導回列表；名稱必填；失敗提示錯誤並可再按。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import { fieldByLabel, TRANSFER_FIXTURES } from '../../__tests__/settingsPageKit.test'
import ShortcutEdit from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const SHORTCUT = {
  no: 'P01',
  name: '燙髮套餐',
  services: [{ id: 'sv1' }],
  products: [{ id: 'p1' }],
  tickets: [{ id: 't2' }],
  memberships: [{ uuid: 'mc1' }],
}
const setup = (fixtures = {}) =>
  renderPage(<ShortcutEdit match={{ params: { id: 'sc1' } }} />, {
    fixtures: {
      ...TRANSFER_FIXTURES,
      GET_SHORTCUT: { shortcut: SHORTCUT },
      UPDATE_SHORTCUT: { updateShortcut: true },
      DELETE_SHORTCUT: { deleteShortcut: true },
      ...fixtures,
    },
    route: '/shortcut/edit/sc1',
  })
const section = title => within(screen.getByText(title, { selector: 'h5' }).nextElementSibling)
const search = (title, keyword) => fireEvent.change(section(title).getByPlaceholderText('名稱/代號'), { target: { value: keyword } })
const save = () => screen.getByText('儲存').closest('button')
const loaded = () => wait(() => expect(fieldByLabel('名稱')).toHaveValue('燙髮套餐'))
const dialog = () => within(screen.getByRole('dialog'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('編輯組合設定', () => {
  it('帶入代號、名稱與四類已選項目（右側清單），以網址 id 查詢', async () => {
    const { calls } = setup()
    await loaded()
    expect(callsOf(calls, 'GET_SHORTCUT')[0].variables).toEqual({ shortcutId: 'sc1' })
    expect(fieldByLabel('代號')).toHaveValue('P01')
    // 已選的項目同時出現在左側（可選）與右側（已選）
    expect(section('服務項目').getAllByText('S1 - 燙髮 - 2000')).toHaveLength(2)
    expect(section('店販銷售').getAllByText('G1 - 洗髮精 - 450')).toHaveLength(2)
    expect(section('預收卡').getAllByText('T2 - 洗髮券 - 200')).toHaveLength(2)
    expect(section('會員卡').getAllByText('C1 - 年卡 - 12000')).toHaveLength(2)
  })

  it('修改後儲存：送出 id 與新的代號、名稱、四類 id，成功導回列表', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'P09' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '燙髮加護髮' } })
    fireEvent.click(section('服務項目').getByText('S2 - 護髮 - 800').closest('button'))
    fireEvent.click(section('服務項目').getByLabelText('加入選取項目'))
    fireEvent.click(save())
    await wait(() => expect(currentLocation()).toBe('/shortcut'))
    expect(callsOf(calls, 'UPDATE_SHORTCUT')[0].variables).toEqual({
      input: {
        id: 'sc1',
        newShortcut: { no: 'P09', name: '燙髮加護髮', serviceIds: ['sv1', 'sv2'], productIds: ['p1'], ticketIds: ['t2'], membershipIds: ['mc1'] },
      },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '儲存成功' })
  })

  it('四個清單各自搜尋', async () => {
    setup()
    await loaded()
    search('服務項目', '護')
    expect(section('服務項目').getAllByText('S1 - 燙髮 - 2000')).toHaveLength(1)
    search('店販銷售', 'G2')
    expect(section('店販銷售').getAllByText('G1 - 洗髮精 - 450')).toHaveLength(1)
    search('預收卡', '剪')
    expect(section('預收卡').getAllByText('T2 - 洗髮券 - 200')).toHaveLength(1)
    search('會員卡', '季')
    expect(section('會員卡').getAllByText('C1 - 年卡 - 12000')).toHaveLength(1)
    search('會員卡', '')
    expect(section('會員卡').getAllByText('C1 - 年卡 - 12000')).toHaveLength(2)
  })

  it('刪除：確認視窗按取消不送出；按確認送出組合 id 並導回列表', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.click(screen.getByText('刪除'))
    expect(dialog().getByText('確認要刪除此組合？')).toBeInTheDocument()
    fireEvent.click(dialog().getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(callsOf(calls, 'DELETE_SHORTCUT')).toHaveLength(0)
    fireEvent.click(screen.getByText('刪除'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(currentLocation()).toBe('/shortcut'))
    expect(callsOf(calls, 'DELETE_SHORTCUT')[0].variables).toEqual({ deleteShortcutId: 'sc1' })
  })

  it('刪除失敗提示錯誤、按鈕恢復可按', async () => {
    setup({ DELETE_SHORTCUT: new Error('組合使用中') })
    await loaded()
    fireEvent.click(screen.getByText('刪除'))
    fireEvent.click(dialog().getByText('確認'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '組合使用中' }))
    await wait(() => expect(dialog().getByText('確認').closest('button')).toBeEnabled())
    expect(currentLocation()).toBe('/shortcut/edit/sc1')
  })

  it('名稱空白提示名稱不得為空；儲存失敗提示錯誤；都可再按', async () => {
    const { calls } = setup({ UPDATE_SHORTCUT: new Error('代號重複') })
    await loaded()
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '' } })
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '名稱不得為空' }))
    expect(callsOf(calls, 'UPDATE_SHORTCUT')).toHaveLength(0)
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '套餐' } })
    fireEvent.click(save())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    await wait(() => expect(save()).toBeEnabled())
  })
})
