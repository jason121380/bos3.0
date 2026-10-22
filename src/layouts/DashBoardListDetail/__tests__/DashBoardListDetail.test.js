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

  it('已知缺口（待 Jason 決定）：「設計師業績分析表」「商品庫存表」「顧客消費排行榜」「顧客入金排行榜」不在分類的顯示清單內，只有這些權限時整個分類不出現', async () => {
    await renderList(userFixture(reports(['設計師業績分析表', '商品庫存表', '顧客消費排行榜', '顧客入金排行榜'])))
    expect(tabs()).toEqual([])
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

  it('已知缺口（待 Jason 決定）：沒有登入資料時導向登入頁，但同一次渲染仍以 "/auth/login" 當 id 送出權限查詢（回應若有權限還會畫出連結）', async () => {
    localStorage.clear()
    // jsdom 不支援真的換頁（會印出 Not implemented: navigation），這裡只鎖住送出的查詢與畫面
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { calls } = await renderList(userFixture(reports(['店家日報表'])))
    spy.mockRestore()
    expect(callsOf(calls, 'FETCH_USER').map(c => c.variables)).toContainEqual({ input: { id: '/auth/login' } })
    expect(links()).toEqual([['店家日報表', '/merchant-daily-report']])
  })
})
