// 保護個人頁與員工資料頁讀角色權限：角色缺「個人檔案」／「編輯員工」區塊（舊角色）時頁面照常顯示、不顯示任何分頁，
// 原本直接取 [0].pageAuthority 拋錯，整頁變錯誤畫面；並以角色 id 比對，同名角色不會讀到別人的分頁權限。
import React from 'react'
import { cleanup, screen, wait } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import Profile from '..'
import EmployeeManagementDetail from '../../EmployeeManagementDetail'

jest.setTimeout(20000)

jest.mock('socket.io-client', () => () => ({ on: () => {}, off: () => {}, emit: () => {}, disconnect: () => {} }))

const role = (id, settings) => ({ id, authorityName: '設計師', authoritySettings: JSON.stringify(settings) })
const section = (pageTitle, pageName) => ({ pageTitle, authority: true, pageAuthority: [{ pageName, authority: true }] })

const fixtures = authorities => ({
  PROFILE: { me: { id: 'user-1', name: '店長小林', merchantIdentity: { authorityName: '設計師', authorityId: 'auth-2' } } },
  GET_MERCHANT_AUTHORITIES: { getMerchantAuthorities: authorities },
  GET_USER_PINNED_TABLE_SETTING: { getUserPinnedTableSettings: { usingStoreIds: [], pinnedSettings: '[]' } },
})

// 停在「密碼與安全」分頁：只驗分頁列，避開其他分頁內容對假資料的額外要求
const pages = [
  ['個人頁', Profile, '個人檔案', '/profile/security', { params: { tab: 'security' } }],
  ['員工資料', EmployeeManagementDetail, '編輯員工', '/management/employees/emp-1/security', { params: { tab: 'security', id: 'emp-1' } }],
]

beforeEach(() => loginAs())
afterEach(cleanup)

describe.each(pages)('%s', (name, Page, pageTitle, route, match) => {
  it(`角色缺「${pageTitle}」區塊時頁面照常顯示，不顯示分頁`, async () => {
    const { settle } = renderPage(<Page match={match} history={{ push: () => {} }} />, {
      route,
      fixtures: fixtures([role('auth-2', [section('客戶管理', '客戶列表')])]),
    })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    expect(screen.queryByText('基本資料')).toBeNull()
  })

  it('同名角色以 id 比對：只依登入者自己的角色顯示分頁', async () => {
    const { settle } = renderPage(<Page match={match} history={{ push: () => {} }} />, {
      route,
      fixtures: fixtures([role('auth-1', []), role('auth-2', [section(pageTitle, '基本資料')])]),
    })
    await settle()
    await wait(() => expect(screen.getAllByText('基本資料').length).toBeGreaterThan(0))
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  })
})
