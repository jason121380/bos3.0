// 保護「活動店家參與列表」：每個活動的參與店家數；展開後列出店家（滑過顯示台灣日期的參與日期）、可收合；
// 全部展開／收合；沒有店家的活動沒有展開鈕；沒有資料時顯示空狀態。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import MerchantParticipatingList from '..'

jest.setTimeout(20000)

// 台灣 2026/10/22 00:30（UTC 10/21 16:30）
const TW_1022 = Date.UTC(2026, 9, 21, 16, 30)
const LIST = [
  {
    id: 'e1',
    name: '周年慶',
    merchantList: [
      { id: 'm1', name: '台北店', joinTime: TW_1022 },
      { id: 'm2', name: '台中店', joinTime: TW_1022 },
    ],
  },
  { id: 'e2', name: '春季活動', merchantList: [{ id: 'm3', name: '高雄店', joinTime: TW_1022 }] },
  { id: 'e3', name: '沒人參加', merchantList: [] },
]
const setup = (list = LIST) =>
  renderPage(<MerchantParticipatingList />, {
    fixtures: { GET_MERCHANT_PARTICIPATING_LIST: { merchantParticipatingList: list } },
    route: '/merchant-participating-list',
  })
const row = name => within(screen.getByText(name).closest('tr'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('活動店家參與列表', () => {
  it('列出各活動參與店家數；展開看店家與台灣日期的參與日期，可收合；沒有店家的活動沒有展開鈕', async () => {
    setup()
    expect(await screen.findByText('共 3 個活動')).toBeInTheDocument()
    expect(row('周年慶').getByText('2 家')).toBeInTheDocument()
    expect(row('沒人參加').getByText('0 家')).toBeInTheDocument()
    expect(row('沒人參加').queryByLabelText('展開店家')).toBeNull()
    fireEvent.click(row('周年慶').getByLabelText('展開店家'))
    expect(screen.getByText('台北店').closest('span[title]')).toHaveAttribute('title', '參與日期: 2026/10/22')
    expect(screen.getByText('台中店')).toBeInTheDocument()
    expect(screen.queryByText('高雄店')).toBeNull()
    fireEvent.click(row('周年慶').getByLabelText('收合店家'))
    expect(screen.queryByText('台北店')).toBeNull()
  })

  it('全部展開／全部收合', async () => {
    setup()
    await screen.findByText('共 3 個活動')
    fireEvent.click(screen.getByText('全部展開'))
    expect(screen.getByText('台北店')).toBeInTheDocument()
    expect(screen.getByText('高雄店')).toBeInTheDocument()
    fireEvent.click(screen.getByText('全部收合'))
    expect(screen.queryByText('高雄店')).toBeNull()
  })

  it('沒有資料時顯示空狀態、沒有全部展開鈕', async () => {
    setup([])
    expect(await screen.findByText('目前無活動參與資料')).toBeInTheDocument()
    expect(screen.queryByText('全部展開')).toBeNull()
  })
})
