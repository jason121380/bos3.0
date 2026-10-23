// 保護「組合設定」列表：列出組合（建立者、編輯者、台灣時間的建立／編輯時間、編輯連結）；展開後把服務、店販、預收卡、會員卡
// 依順序並排（各欄筆數不同時以最多的為列數，標籤為「代號 - 名稱 - 價格」，店販與會員卡用售價）；沒有內容的組合顯示無詳細組合資料；
// 全部展開／收合；沒有組合時顯示無資料。GraphQL 全由 testkit 的模擬 link 回應，不連任何後端。
import 'lib/install-business-timezone'
import React from 'react'
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { renderPage, loginAs } from '../../../__tests__/testkit.test'
import Shortcut from '..'

jest.setTimeout(20000)

// 台灣 2026/10/22 09:05（UTC 01:05）
const TW_1022_0905 = Date.UTC(2026, 9, 22, 1, 5)
const SHORTCUTS = [
  {
    id: 's1',
    name: '燙髮套餐',
    no: 'P01',
    createdAt: TW_1022_0905,
    updatedAt: TW_1022_0905,
    creator: { name: '店長' },
    editor: { name: '助理' },
    services: [
      { no: 'S1', name: '燙髮', price: 2000 },
      { no: 'S2', name: '護髮', price: 800 },
      { no: 'S3', name: '剪髮', price: 500 },
      { no: 'S4', name: '染髮', price: 1500 },
    ],
    products: [{ no: 'G1', name: '洗髮精', sellPrice: 450 }],
    memberships: [
      { no: null, name: '年卡', sellPrice: 12000 },
      { no: 'C2', name: '季卡', sellPrice: 5000 },
      { no: 'C3', name: '月卡', sellPrice: 2000 },
    ],
    tickets: [{ no: 'T1', name: '剪髮券', price: 300 }],
  },
  {
    id: 's2',
    name: '空組合',
    no: 'P02',
    createdAt: TW_1022_0905,
    updatedAt: TW_1022_0905,
    creator: { name: '店長' },
    editor: null,
    services: [],
    products: [],
    memberships: [],
    tickets: [],
  },
  {
    id: 's3',
    name: '只有會員卡',
    no: 'P03',
    createdAt: TW_1022_0905,
    updatedAt: TW_1022_0905,
    creator: { name: '店長' },
    editor: null,
    services: [],
    products: [],
    memberships: [{ no: 'C9', name: '體驗卡', sellPrice: 99 }],
    tickets: [],
  },
]
const setup = (shortcuts = SHORTCUTS) =>
  renderPage(<Shortcut />, { fixtures: { GET_SHORTCUTS: { shortcuts } }, route: '/shortcut' })
const row = name => within(screen.getByText(name).closest('tr'))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('組合設定', () => {
  it('列出組合：代號、建立者、編輯者、台灣時間；沒有編輯者留空；編輯連到該組合', async () => {
    setup()
    expect(await screen.findByText('共 3 筆')).toBeInTheDocument()
    const perm = row('燙髮套餐')
    expect(perm.getByText('P01')).toBeInTheDocument()
    expect(perm.getByText('店長')).toBeInTheDocument()
    expect(perm.getByText('助理')).toBeInTheDocument()
    expect(perm.getAllByText('2026/10/22 09:05')).toHaveLength(2)
    expect(perm.getByLabelText('編輯 燙髮套餐')).toHaveAttribute('href', '/shortcut/edit/s1')
    expect(row('空組合').queryByText('助理')).toBeNull()
  })

  it('展開：四類項目依順序並排（以最多的為列數），標籤含代號、名稱與價格；可收合', async () => {
    setup()
    await screen.findByText('共 3 筆')
    fireEvent.click(row('燙髮套餐').getByLabelText('展開組合內容'))
    const firstLine = within(screen.getByText('S1 - 燙髮 - 2000').closest('tr'))
    expect(firstLine.getByText('G1 - 洗髮精 - 450')).toBeInTheDocument()
    expect(firstLine.getByText('T1 - 剪髮券 - 300')).toBeInTheDocument()
    // 會員卡沒有代號時只顯示名稱與售價
    expect(firstLine.getByText('年卡 - 12000')).toBeInTheDocument()
    const secondLine = screen.getByText('S2 - 護髮 - 800').closest('tr')
    expect(within(secondLine).getByText('C2 - 季卡 - 5000')).toBeInTheDocument()
    expect(secondLine.querySelectorAll('p')).toHaveLength(2)
    const thirdLine = screen.getByText('C3 - 月卡 - 2000').closest('tr')
    expect(within(thirdLine).getByText('S3 - 剪髮 - 500')).toBeInTheDocument()
    // 第四列只有服務，其他欄留空
    const fourthLine = screen.getByText('S4 - 染髮 - 1500').closest('tr')
    expect(fourthLine.querySelectorAll('p')).toHaveLength(1)
    fireEvent.click(row('燙髮套餐').getByLabelText('收合組合內容'))
    expect(screen.queryByText('S1 - 燙髮 - 2000')).toBeNull()
  })

  it('沒有內容的組合展開顯示無詳細組合資料；全部展開／全部收合', async () => {
    setup()
    await screen.findByText('共 3 筆')
    fireEvent.click(screen.getByText('全部展開'))
    expect(screen.getByText('無詳細組合資料')).toBeInTheDocument()
    // 只有會員卡的組合：該列其他三欄留空
    expect(screen.getByText('C9 - 體驗卡 - 99').closest('tr').querySelectorAll('p')).toHaveLength(1)
    expect(screen.getByText('S1 - 燙髮 - 2000')).toBeInTheDocument()
    fireEvent.click(screen.getByText('全部收合'))
    expect(screen.queryByText('無詳細組合資料')).toBeNull()
    expect(screen.getByText('全部展開')).toBeInTheDocument()
  })

  it('沒有組合時顯示無資料', async () => {
    setup([])
    expect(await screen.findByText('無資料')).toBeInTheDocument()
    expect(screen.queryByText('全部展開')).toBeNull()
  })
})
