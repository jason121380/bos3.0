// 保護：報表的設計師下拉與設計師列表依「編號」排序——數字依數值（2 在 10 前）、英數編號也有效（A2 在 A10 前）、沒有編號的排最後。
// 已修正（Jason 2026/10/22 fix all）：原本寫成 a.userNo - b.userNo／a.designerNo - b.designerNo，英數編號相減得 NaN、排序失效，
// 空編號當 0 排最前；改用 utils/compareNo（與共用下拉 EmployeeAutoComplete 相同）。
// GraphQL 由 testkit 的模擬 link 回應，不連後端。
import React from 'react'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs } from '../../__tests__/testkit.test'
import HelperSelfRecord from 'views/Profile/HelperSelfRecord'

jest.setTimeout(20000)

beforeEach(() => loginAs())
afterEach(cleanup)

const user = (userId, userName, userNo) => ({ userId, userName, userNickName: null, userNo })
const USERS = [user('u10', '十號', '10'), user('uA10', '甲十', 'A10'), user('uE', '無編號', ''), user('u2', '二號', '2'), user('uA2', '甲二', 'A2')]
const EXPECTED = ['二號 - 2', '十號 - 10', '甲二 - A2', '甲十 - A10', '無編號']

// 設計師篩選欄：TextField 的標籤指向輸入框；消費分析儀表板的標籤（Field htmlFor）沒有對到輸入框，改從標籤所在欄位找
const designerInput = () =>
  screen.queryAllByLabelText('設計師篩選').find(el => el.tagName === 'INPUT') ||
  screen.getByText('設計師篩選', { selector: 'label' }).parentElement.querySelector('input')

const renderModule = modulePath => {
  const Page = require(modulePath).default
  return renderPage(<Page match={{ params: { id: '1' } }} location={{ pathname: '/page/1', search: '' }} />, {
    route: '/page/1',
    // 其他查詢一律回失敗（這幾頁在 API 失敗時仍顯示篩選列，見 pages.smoke.test.js），只回設計師清單
    fallback: 'error',
    fixtures: { GET_USERS_ORDERABLE_LIST: { getUserOrderableList: USERS } },
  })
}

describe('報表的設計師篩選：選項依編號自然排序，沒有編號的排最後', () => {
  it.each([
    ['views/ConsumptionAnalyticsDashboard'],
    ['views/CustomerWalletLeaderboard'],
    ['views/CustomerConsumptionLeaderboard'],
    ['views/DesignerPerforamnceAnalyzeReport'],
  ])('%s', async modulePath => {
    const { settle } = renderModule(modulePath)
    await settle()
    fireEvent.click(designerInput())
    expect((await screen.findAllByRole('option')).map(o => o.textContent)).toEqual(EXPECTED)
  })
})

describe('個人頁互助報表：依設計師編號排序', () => {
  const record = (designerNo, name, nickName = null) => ({ user: { designerNo, name, nickName }, helperRecord: [], productRecord: [] })

  it('數字開頭的編號依自然排序（2、3A、10），其後為其他編號、沒有編號的依暱稱／姓名', async () => {
    const T = new Date(2026, 9, 20).getTime()
    const { settle } = renderPage(
      <HelperSelfRecord
        helperReport={[record('10', '十號'), record('3A', '三甲'), record('', '無編號', '小無'), record('B', '乙號'), record('2', '二號')]}
        titleDate={T}
        dateForHelper={{ startDate: T, endDate: T }}
        setDateForHelper={() => {}}
        priceDisplayOnReport
        isLoading={false}
      />
    )
    await settle()
    const titles = screen.getAllByText(/互助報表$/).map(el => el.textContent.split(' 2026/10/20')[0].trim())
    expect(titles).toEqual(['2  二號', '3A  三甲', '10  十號', 'B  乙號', '小無 無編號'])
  })

  // 已修正（Jason 2026/10/22 fix all）：designerNo 為 null 時，第二個 filter 讀 null.length 整頁拋錯；改為 null 視為空代號（依暱稱／姓名排在最後）
  it('編號為 null 視為沒有編號，不會整頁拋錯', async () => {
    const T = new Date(2026, 9, 20).getTime()
    const { settle } = renderPage(
      <HelperSelfRecord
        helperReport={[record(null, '乙員'), record('2', '二號'), record(null, '甲員', '小甲')]}
        titleDate={T}
        dateForHelper={{ startDate: T, endDate: T }}
        setDateForHelper={() => {}}
        priceDisplayOnReport
        isLoading={false}
      />
    )
    await settle()
    const titles = screen.getAllByText(/互助報表$/).map(el => el.textContent.split(' 2026/10/20')[0].trim())
    expect(titles).toEqual(['2  二號', '小甲 甲員', '乙員'])
  })
})
