// 保護什麼：報表目錄（/dashboard-list-detail）只列出登入者角色「報表及分析」中有權限的報表。
// - 分類（日報表／營業／設計師…）只有在其中至少一張報表有權限時才出現；預設選第一個有權限的分類。
// - 每張報表連結只在該頁 authority 為 true 時出現；其他區塊（如「櫃檯作業」）的同名權限不算。
// - 權限尚未載入或沒有任何權限時不畫分類（不會切到無權限分類）。
// GraphQL 一律由 testkit 的模擬 link 回應（FETCH_USER）。
import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import DashBoardListDetail from '..'

const pages = names => names.map(pageName => ({ pageName, authority: true }))
const userFixture = pageAuthority => ({ FETCH_USER: { user: { id: 'user-1', pageAuthority: { authorityName: '店長', pageAuthority } } } })
const reports = (names, extra = []) => [{ pageTitle: '報表及分析', authority: true, pageAuthority: [...pages(names), ...extra] }]

const renderList = async fixtures => {
  const utils = renderPage(<DashBoardListDetail />, { fixtures })
  await utils.settle()
  return utils
}
const tabs = () => screen.queryAllByRole('tab').map(t => t.textContent)
const links = () => screen.queryAllByRole('link').map(a => [a.textContent, a.getAttribute('href')])

beforeEach(() => loginAs())

describe('報表目錄', () => {
  it('只顯示有權限的分類與報表，預設選第一個分類', async () => {
    const { calls } = await renderList(userFixture(reports(['店家日報表', '店家排行榜'], [{ pageName: '設計師日報表', authority: false }])))
    expect(tabs()).toEqual(['日報表', '營業'])
    expect(screen.getByRole('heading', { name: '日報表' })).toBeInTheDocument()
    expect(links()).toEqual([['店家日報表', '/merchant-daily-report']])
    // 以登入者 id 查權限
    expect(callsOf(calls, 'FETCH_USER')[0].variables).toEqual({ input: { id: 'user-1' } })
  })

  it('切換分類後顯示該分類有權限的報表', async () => {
    await renderList(userFixture(reports(['店家日報表', '店家排行榜'])))
    fireEvent.mouseDown(screen.getByRole('tab', { name: '營業' }), { button: 0 })
    expect(links()).toEqual([['店家排行榜', '/merchant-leader-board']])
  })

  it('第一個分類沒有權限時預設選有權限的分類', async () => {
    await renderList(userFixture(reports(['互助排行榜', '損益表'])))
    expect(tabs()).toEqual(['互助', '管理分析'])
    expect(links()).toEqual([['互助排行榜', '/helper-leaderboard']])
  })

  it('其他區塊的同名權限不算；沒有任何報表權限時不畫分類', async () => {
    await renderList(userFixture([{ pageTitle: '櫃檯作業', authority: true, pageAuthority: pages(['店家日報表']) }]))
    expect(tabs()).toEqual([])
    expect(screen.getByRole('heading', { name: '報表目錄' })).toBeInTheDocument()
  })

  // Jason 2026/10/22 fix all：這四張報表原本不在分類的顯示清單內，只有這些權限時整個分類不出現；已補進清單（名稱與 NavBar／pageData 相同）
  it('只有「設計師業績分析表」「商品庫存表」「顧客消費排行榜」「顧客入金排行榜」權限時，所屬分類照常出現', async () => {
    await renderList(userFixture(reports(['設計師業績分析表', '商品庫存表', '顧客消費排行榜', '顧客入金排行榜'])))
    expect(tabs()).toEqual(['設計師', '商品', '管理分析'])
    expect(links()).toEqual([['設計師業績分析表', '/designer-perforamnce-analyze-report']])
    fireEvent.mouseDown(screen.getByRole('tab', { name: '商品' }), { button: 0 })
    expect(links()).toEqual([['商品庫存表', '/product-inventoryList']])
    fireEvent.mouseDown(screen.getByRole('tab', { name: '管理分析' }), { button: 0 })
    expect(links()).toEqual([
      ['顧客消費排行榜', '/customer-consumption-leaderboard'],
      ['顧客入金排行榜', '/customer-wallet-leaderboard'],
    ])
  })

  // 「設計師店販抽成明細」前端沒有這張報表（自初版起只出現在這份清單）：只有這個權限時「商品」分類會出現但點進去是空的。
  // Jason 2026/10/22 選 B：從清單移除，不再讓分類因它出現（權限設定本身不受影響）
  it('只有「設計師店販抽成明細」權限時不出現「商品」分類（沒有這張報表，不顯示空分類）', async () => {
    await renderList(userFixture(reports(['設計師店販抽成明細', '店家日報表'])))
    expect(tabs()).toEqual(['日報表'])
  })

  it('同分類內其他報表有權限時，上述報表的連結照常出現', async () => {
    await renderList(userFixture(reports(['設計師排行榜', '設計師業績分析表'])))
    expect(tabs()).toEqual(['設計師'])
    expect(links().map(l => l[0])).toEqual(['設計師業績分析表', '設計師排行榜'])
  })

  it('登入資料沒有 id 時以 null 查詢（不送 undefined）', async () => {
    loginAs({ user: { name: '無 id' } })
    const { calls } = await renderList(userFixture(reports(['店家日報表'])))
    expect(callsOf(calls, 'FETCH_USER')[0].variables).toEqual({ input: { id: null } })
  })

  it('登入資料存成 null（字串 "null"）時同樣以 null 查詢、不拋錯', async () => {
    localStorage.clear()
    localStorage.setItem('user', null)
    const { calls } = await renderList(userFixture(reports(['店家日報表'])))
    expect(callsOf(calls, 'FETCH_USER')[0].variables).toEqual({ input: { id: null } })
  })

  // Jason 2026/10/22 fix all：原本導向登入頁的同一次渲染仍以 "/auth/login" 當 id 送出權限查詢、回應有權限時還畫出連結；
  // 改為沒有登入資料就導向登入並直接結束，不送權限查詢、不畫內容
  it('沒有登入資料時導向登入頁，不送權限查詢、不畫連結', async () => {
    localStorage.clear()
    // jsdom 不支援真的換頁（會印出 Not implemented: navigation），這裡只確認送出的查詢與畫面
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { calls } = await renderList(userFixture(reports(['店家日報表'])))
    spy.mockRestore()
    expect(callsOf(calls, 'FETCH_USER')).toEqual([])
    expect(links()).toEqual([])
    expect(screen.queryByRole('heading', { name: '報表目錄' })).toBeNull()
  })
})
