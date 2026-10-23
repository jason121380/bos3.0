// 保護「會員卡列表」：列出會員卡（類別、成本、價格、變更者、台灣日期；沒有類別顯示未分類），停用的卡不能進編輯；
// 篩選送出的關鍵字與類別、清除條件；報表匯出內容；勾選（全選只選啟用中的）後批次刪除（先確認）、批次改類別送出的 uuid，
// 成功重新整理、失敗提示錯誤並清除勾選。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import { pickOption, stubLocation } from '../../__tests__/settingsPageKit.test'
import MemberCardRecord from '..'

jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
// 匯出元件換成把資料放在屬性上的連結，以便檢查匯出內容（不產生檔案）
jest.mock('react-csv', () => ({
  CSVLink: ({ data, filename, children }) => (
    <a data-testid="csv" data-filename={filename} data-rows={JSON.stringify(data)} href="#csv">
      {children}
    </a>
  ),
}))
jest.setTimeout(20000)

// 台灣 2026/10/22 01:00（UTC 10/21 17:00）
const TW_1022_0100 = Date.UTC(2026, 9, 21, 17, 0)
const card = overrides => ({
  uuid: 'm1',
  no: 'M01',
  name: '萬元儲值卡',
  membershipCategory: { id: '1', uuid: 'cat-1', name: '儲值卡' },
  cost: 1000,
  sellPrice: 12000,
  isUsing: true,
  updatedAt: TW_1022_0100,
  creator: { id: 'u1', name: '店長' },
  ...overrides,
})
const CARDS = [
  card(),
  card({ uuid: 'm2', no: 'M02', name: '年卡', membershipCategory: null, creator: null, sellPrice: 3000 }),
  card({ uuid: 'm3', no: 'M03', name: '舊卡', isUsing: false }),
]
const CATEGORIES = [
  { uuid: 'cat-1', no: 'A01', name: '儲值卡' },
  { uuid: 'cat-2', no: 'A02', name: '年卡類' },
]
const setup = ({ cards = CARDS, ...fixtures } = {}) =>
  renderPage(<MemberCardRecord />, {
    fixtures: {
      FETCH_MEMBERSHIPS: { memberships: { data: cards } },
      FETCH_MEMBERSHIPS_CATEGORY: { membershipCategories: CATEGORIES },
      ...fixtures,
    },
    route: '/member-card-record',
  })
const row = name => screen.getByText(name).closest('tr')
const toolbar = () => within(screen.getByRole('toolbar', { hidden: true }))
const lastInput = calls => {
  const list = callsOf(calls, 'FETCH_MEMBERSHIPS')
  return list[list.length - 1].variables.input
}

let restoreLocation
beforeEach(() => {
  loginAs()
  restoreLocation = stubLocation()
})
afterEach(() => {
  cleanup()
  restoreLocation()
})

describe('會員卡列表', () => {
  it('列出會員卡；沒有類別顯示未分類、沒有變更者留空；停用的卡不能進編輯', async () => {
    setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    const first = within(row('萬元儲值卡'))
    expect(first.getByText('儲值卡')).toBeInTheDocument()
    expect(first.getByText('1,000')).toBeInTheDocument()
    expect(first.getByText('12,000')).toBeInTheDocument()
    expect(first.getByText('店長')).toBeInTheDocument()
    expect(first.getByText('2026/10/22')).toBeInTheDocument()
    expect(first.getByLabelText('編輯會員卡')).toHaveAttribute('href', '/member-card/edit/m1')
    expect(first.getByLabelText('編輯會員卡')).not.toHaveAttribute('aria-disabled')
    expect(within(row('年卡')).getByText('未分類')).toBeInTheDocument()
    const old = within(row('舊卡')).getByLabelText('編輯會員卡')
    expect(old).toHaveAttribute('aria-disabled', 'true')
    expect(old).toHaveAttribute('tabindex', '-1')
    expect(row('舊卡')).toHaveAttribute('data-state', 'selected')
  })

  it('報表匯出：代號、類別（未分類）、名稱、成本、價格、變更者、台灣日期', async () => {
    setup()
    await screen.findByText('共 3 筆')
    const csv = screen.getByTestId('csv')
    expect(csv).toHaveAttribute('data-filename', '會員卡列表.csv')
    const rows = JSON.parse(csv.getAttribute('data-rows'))
    expect(rows[0]).toEqual({ 代號: 'M01', 類別: '儲值卡', 名稱: '萬元儲值卡', 成本: 1000, 價格: 12000, 變更者: '店長', 變更時間: '2026/10/22' })
    expect(rows[1]).toEqual(expect.objectContaining({ 類別: '未分類', 變更者: '' }))
    expect(rows).toHaveLength(3)
  })

  it('篩選：關鍵字搜尋、點類別篩選（已選的類別按鈕停用），清除後回到全部', async () => {
    const { calls } = setup()
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByText('篩選'))
    fireEvent.change(screen.getByPlaceholderText('搜尋關鍵字'), { target: { value: '儲值' } })
    fireEvent.click(screen.getByText('搜尋'))
    await wait(() => expect(lastInput(calls)).toEqual({ pageOffset: 0, keyword: '儲值', categoryUUIds: [] }))
    const yearly = screen.getByRole('button', { name: '年卡類' })
    fireEvent.click(yearly)
    await wait(() => expect(lastInput(calls)).toEqual({ pageOffset: 0, keyword: '儲值', categoryUUIds: ['cat-2'] }))
    expect(screen.getByRole('button', { name: '年卡類' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '年卡類' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '儲值卡' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByText('清除'))
    await wait(() => expect(lastInput(calls)).toEqual({ keyword: '', categoryUUIds: [] }))
    expect(screen.getByRole('button', { name: '年卡類' })).toBeEnabled()
    fireEvent.click(screen.getByText('篩選'))
    expect(screen.queryByPlaceholderText('搜尋關鍵字')).toBeNull()
  })

  it('全選只選啟用中的卡；單選可勾可取消；全部啟用時全選可取消', async () => {
    setup()
    await screen.findByText('共 3 筆')
    const all = screen.getByLabelText('全選')
    fireEvent.click(all)
    expect(screen.getByTestId('membership-萬元儲值卡-checkbox')).toBeChecked()
    expect(screen.getByTestId('membership-舊卡-checkbox')).not.toBeChecked()
    fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
    expect(screen.getByTestId('membership-年卡-checkbox')).not.toBeChecked()
    fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
    expect(toolbar().getByText('已選 2 筆')).toBeInTheDocument()
    cleanup()

    setup({ cards: CARDS.slice(0, 2) })
    await screen.findByText('共 2 筆')
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('全選')).toBeChecked()
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByTestId('membership-年卡-checkbox')).not.toBeChecked()
  })

  it('全部停用或沒有會員卡時全選不可用', async () => {
    setup({ cards: [CARDS[2]] })
    await screen.findByText('共 1 筆')
    expect(screen.getByLabelText('全選')).toBeDisabled()
    cleanup()
    setup({ cards: [] })
    await screen.findByText('共 0 筆')
    expect(screen.getByLabelText('全選')).toBeDisabled()
  })

  // Jason 2026/10/22「照建議」：批次刪除原本按下即刪，改為先跳確認視窗（比照打卡記錄刪除），確定才送出；取消不送出、保留勾選。
  it('批次刪除先確認：取消不送出、保留勾選', async () => {
    const { calls, settle } = setup({ deleteMembership: { deleteMembership: true } })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('membership-萬元儲值卡-checkbox'))
    fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
    fireEvent.click(toolbar().getByText('刪除'))
    const dialog = within(await screen.findByRole('dialog'))
    expect(dialog.getByText('確定要刪除選取的 2 張會員卡嗎？')).toBeInTheDocument()
    expect(dialog.getByText('刪除後無法復原。')).toBeInTheDocument()
    fireEvent.click(dialog.getByText('取消'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    await settle()
    expect(callsOf(calls, 'deleteMembership')).toHaveLength(0)
    expect(screen.getByTestId('membership-年卡-checkbox')).toBeChecked()
  })

  it('批次刪除確認後送出勾選的 uuid，成功後提示並重新整理', async () => {
    const { calls } = setup({ deleteMembership: { deleteMembership: true } })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('membership-萬元儲值卡-checkbox'))
    fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
    fireEvent.click(toolbar().getByText('刪除'))
    expect(callsOf(calls, 'deleteMembership')).toHaveLength(0)
    fireEvent.click(await screen.findByTestId('confirm'))
    await wait(() => expect(window.location.reload).toHaveBeenCalled())
    expect(callsOf(calls, 'deleteMembership')[0].variables).toEqual({ itemUUIDs: ['m1', 'm2'] })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '成功刪除會員卡', variant: 'success' })
  })

  it('刪除失敗：提示錯誤、清除勾選、不重新整理', async () => {
    setup({ deleteMembership: new Error('會員卡已售出') })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('membership-萬元儲值卡-checkbox'))
    fireEvent.click(toolbar().getByText('刪除'))
    fireEvent.click(await screen.findByTestId('confirm'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '會員卡已售出', variant: 'error' }))
    expect(screen.getByTestId('membership-萬元儲值卡-checkbox')).not.toBeChecked()
    expect(window.location.reload).not.toHaveBeenCalled()
  })

  it('批次改類別：選類別後送出勾選的會員卡與類別 uuid，成功重新整理；可按關閉取消', async () => {
    const { calls } = setup({ multipleUpdateMembershipCategory: { multipleUpdateMembershipCategory: true } })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('membership-萬元儲值卡-checkbox'))
    fireEvent.click(toolbar().getByText('編輯會員卡類別'))
    const dialog = within(await screen.findByRole('dialog'))
    fireEvent.click(dialog.getByText('關閉'))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(toolbar().getByText('編輯會員卡類別'))
    const reopened = within(await screen.findByRole('dialog'))
    pickOption(reopened.getByRole('combobox'), 'A02 年卡類')
    fireEvent.click(reopened.getByText('儲存'))
    await wait(() => expect(window.location.reload).toHaveBeenCalled())
    expect(callsOf(calls, 'multipleUpdateMembershipCategory')[0].variables).toEqual({
      input: { membershipUUIDs: ['m1'], membershipCategoryUUIDs: 'cat-2' },
    })
    expect(openSnackbar).toHaveBeenCalledWith({ message: '編輯會員類別成功', variant: 'success' })
  })

  it('批次改類別失敗：提示錯誤、關閉視窗並清除勾選', async () => {
    setup({ multipleUpdateMembershipCategory: new Error('類別不存在') })
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByTestId('membership-年卡-checkbox'))
    fireEvent.click(toolbar().getByText('編輯會員卡類別'))
    const dialog = within(await screen.findByRole('dialog'))
    pickOption(dialog.getByRole('combobox'), 'A01 儲值卡')
    fireEvent.click(dialog.getByText('儲存'))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '類別不存在', variant: 'error' }))
    await wait(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByTestId('membership-年卡-checkbox')).not.toBeChecked()
  })

  it('會員卡查詢失敗時顯示載入骨架，不整頁壞', async () => {
    renderPage(<MemberCardRecord />, { fallback: 'error', route: '/member-card-record' })
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(screen.getByText('會員卡列表')).toBeInTheDocument()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByText(/共 \d+ 筆/)).toBeNull()
  })
})
