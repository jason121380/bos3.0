// 保護「新增組合設定」：載入服務、店販、上架中的預收卡、可販售的會員卡供挑選；四個清單各自以代號／名稱搜尋；
// 加入／移除後送出的代號、名稱與四類 id（會員卡用 uuid）；名稱必填；成功導回組合列表、失敗提示並可再按。
// GraphQL 全由 testkit 的模擬 link 回應，不連任何後端、不建立真實資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import { fieldByLabel, TRANSFER_FIXTURES } from '../../__tests__/settingsPageKit.test'
import ShortcutCreate from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
jest.setTimeout(20000)

const setup = (fixtures = {}) =>
  renderPage(<ShortcutCreate />, {
    fixtures: { ...TRANSFER_FIXTURES, CREATE_SHORTCUT: { createShortcut: true }, ...fixtures },
    route: '/shortcut/create',
  })
// 某個挑選區（服務項目／店販銷售／預收卡／會員卡）
const section = title => within(screen.getByText(title, { selector: 'h5' }).nextElementSibling)
const pick = (title, labels) => {
  labels.forEach(label => fireEvent.click(section(title).getAllByText(label)[0].closest('button')))
  fireEvent.click(section(title).getByLabelText('加入選取項目'))
}
const search = (title, keyword) => fireEvent.change(section(title).getByPlaceholderText('名稱/代號'), { target: { value: keyword } })
const submit = () => screen.getByText('新增').closest('button')
const loaded = () => screen.findByText('S1 - 燙髮 - 2000')

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('新增組合設定', () => {
  it('載入四類可挑選項目：預收卡只取上架中、會員卡只取可販售', async () => {
    const { calls } = setup()
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
    await loaded()
    expect(callsOf(calls, 'GET_TICKETS_FOR_TRANSFERLIST')[0].variables).toEqual({ keyword: '', categoryIds: [], isLaunched: true })
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_TRANSFERLIST')[0].variables).toEqual({ input: { isAvailableForSale: true } })
    expect(section('店販銷售').getByText('G1 - 洗髮精 - 450')).toBeInTheDocument()
    expect(section('預收卡').getByText('T1 - 剪髮券 - 300')).toBeInTheDocument()
    expect(section('會員卡').getByText('C1 - 年卡 - 12000')).toBeInTheDocument()
  })

  it('挑選後送出代號、名稱與四類 id（會員卡為 uuid），成功導回組合列表', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('代號'), { target: { value: 'P01' } })
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '燙髮套餐' } })
    pick('服務項目', ['S1 - 燙髮 - 2000', '頭皮按摩 - 600'])
    pick('店販銷售', ['G2 - 髮蠟 - 350'])
    pick('預收卡', ['T1 - 剪髮券 - 300'])
    pick('會員卡', ['C2 - 季卡 - 5000'])
    fireEvent.click(submit())
    await wait(() => expect(currentLocation()).toBe('/shortcut'))
    expect(callsOf(calls, 'CREATE_SHORTCUT')[0].variables).toEqual({
      input: { no: 'P01', name: '燙髮套餐', serviceIds: ['sv1', 'sv3'], productIds: ['p2'], ticketIds: ['t1'], membershipIds: ['mc2'] },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ variant: 'success', message: '新增成功' })
  })

  it('可從右側移除已加入的項目', async () => {
    const { calls } = setup()
    await loaded()
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '套餐' } })
    pick('服務項目', ['S1 - 燙髮 - 2000', 'S2 - 護髮 - 800'])
    // 右側清單：點選要移除的列再按移除
    const added = section('服務項目').getAllByText('S1 - 燙髮 - 2000')
    fireEvent.click(added[added.length - 1].closest('button'))
    fireEvent.click(section('服務項目').getByLabelText('移除選取項目'))
    fireEvent.click(submit())
    await wait(() => expect(callsOf(calls, 'CREATE_SHORTCUT')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_SHORTCUT')[0].variables.input.serviceIds).toEqual(['sv2'])
  })

  it('四個清單各自以代號或名稱搜尋，清除後恢復全部', async () => {
    setup()
    await loaded()
    search('服務項目', 'S2')
    expect(section('服務項目').queryByText('S1 - 燙髮 - 2000')).toBeNull()
    expect(section('服務項目').getByText('S2 - 護髮 - 800')).toBeInTheDocument()
    // 沒有代號的項目以名稱比對
    search('服務項目', '按摩')
    expect(section('服務項目').getByText('頭皮按摩 - 600')).toBeInTheDocument()
    expect(section('服務項目').queryByText('S2 - 護髮 - 800')).toBeNull()
    search('服務項目', '')
    expect(section('服務項目').getByText('S1 - 燙髮 - 2000')).toBeInTheDocument()
    search('店販銷售', '髮蠟')
    expect(section('店販銷售').queryByText('G1 - 洗髮精 - 450')).toBeNull()
    search('預收卡', 'T2')
    expect(section('預收卡').queryByText('T1 - 剪髮券 - 300')).toBeNull()
    search('會員卡', '季')
    expect(section('會員卡').queryByText('C1 - 年卡 - 12000')).toBeNull()
    expect(section('會員卡').getByText('C2 - 季卡 - 5000')).toBeInTheDocument()
  })

  it('名稱空白時提示名稱不得為空、不送出；送出失敗提示錯誤；都可再按', async () => {
    const { calls } = setup({ CREATE_SHORTCUT: new Error('代號重複') })
    await loaded()
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '名稱不得為空' }))
    expect(callsOf(calls, 'CREATE_SHORTCUT')).toHaveLength(0)
    expect(submit()).toBeEnabled()
    fireEvent.change(fieldByLabel('名稱'), { target: { value: '套餐' } })
    fireEvent.click(submit())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ variant: 'error', message: '代號重複' }))
    await wait(() => expect(submit()).toBeEnabled())
    expect(currentLocation()).toBe('/shortcut/create')
  })
})
