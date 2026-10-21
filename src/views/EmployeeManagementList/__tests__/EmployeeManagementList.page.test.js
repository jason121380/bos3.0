// 保護「員工列表」：列出員工與登入狀態、抽成／服務扣項未設定時提示（漏設會讓薪資算錯）、可打單／可被預約等狀態；
// 只有角色有「批量抽成設定」權限才出現勾選欄。GraphQL 全由 MockedProvider（testkit 的模擬 link）回應。
import React from 'react'
import { cleanup, screen, within } from '@testing-library/react'
import { renderPage, loginAs, callsOf, USER_ID } from '../../../__tests__/testkit.test'
import EmployeeManagementList from '..'

jest.setTimeout(20000)

const employee = (overrides = {}) => ({
  id: 'e1',
  avatar: null,
  status: 'ok',
  lastName: '王',
  firstName: '小美',
  nickName: 'Amy',
  cellphone: '0911000111',
  designerNo: '01',
  merchantIdentity: { authorityName: '設計師' },
  isUserRakeSet: true,
  deductionWay: '依服務',
  isDisplayOnBookingList: true,
  isDisplayOnServiceList: true,
  isDisplayOnPerformanceList: false,
  isDisplayOnBookingRecord: false,
  ...overrides,
})

const EMPLOYEES = [
  employee(),
  employee({
    id: 'e2',
    lastName: '林',
    firstName: '大明',
    nickName: '',
    designerNo: '02',
    status: 'banned',
    merchantIdentity: { authorityName: '' },
    isUserRakeSet: false,
    deductionWay: '無扣項',
    isDisplayOnBookingList: false,
    isDisplayOnServiceList: false,
  }),
]

const fixtures = ({ rakeAuthority = true } = {}) => ({
  DESIGNER: { merchantDesigner: { id: USER_ID, merchantIdentity: { authorityName: '店長', authorityId: 'auth-1' } } },
  GET_MERCHANT_AUTHORITIES: {
    getMerchantAuthorities: [
      {
        id: 'auth-1',
        authorityName: '店長',
        authoritySettings: JSON.stringify([
          { pageTitle: '員工及薪資', authority: true, pageAuthority: [{ pageName: '批量抽成設定', authority: rakeAuthority }] },
        ]),
      },
    ],
  },
  GET_USERS_IN_EMPLOYEE_LIST: { users: { totalCount: EMPLOYEES.length, users: EMPLOYEES } },
})

const setup = options => renderPage(<EmployeeManagementList />, { fixtures: fixtures(options), route: '/management/employee' })
const row = name => screen.getByText(name, { exact: false }).closest('tr')

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

describe('員工列表', () => {
  it('列出員工姓名、編號、角色與登入狀態；沒有角色顯示「無設定」', async () => {
    const { calls } = setup()
    expect(await screen.findByText('共 2 筆')).toBeInTheDocument()
    const amy = within(row('王小美'))
    expect(amy.getByText('01')).toBeInTheDocument()
    expect(amy.getByText('設計師')).toBeInTheDocument()
    expect(amy.getByText('可登入')).toBeInTheDocument()
    const ming = within(row('林大明'))
    expect(ming.getByText('無設定')).toBeInTheDocument()
    expect(ming.getByText('不可登入')).toBeInTheDocument()
    // 以登入者查自己的角色，判斷可用的批量功能
    expect(callsOf(calls, 'DESIGNER')[0].variables).toEqual({ designerId: USER_ID })
    expect(callsOf(calls, 'GET_USERS_IN_EMPLOYEE_LIST')[0].variables.input).toEqual(
      expect.objectContaining({ usagelimit: 'EMPLOYEE_LIST', keyword: '' })
    )
  })

  it('抽成與服務扣項都設定才顯示「設定完成」，否則列出缺少的設定', async () => {
    setup()
    await screen.findByText('共 2 筆')
    expect(within(row('王小美')).getByText('設定完成')).toBeInTheDocument()
    const missing = within(row('林大明')).getByText(/尚未設定抽成/)
    expect(missing).toHaveTextContent('尚未設定服務扣項方式')
  })

  it('顯示員工在打單／預約／報表的出現狀態', async () => {
    setup()
    await screen.findByText('共 2 筆')
    expect(within(row('王小美')).getByText('可打單/可被預約')).toBeInTheDocument()
  })

  it('有「批量抽成設定」權限才可勾選員工；沒有權限時不出現勾選欄', async () => {
    setup({ rakeAuthority: true })
    await screen.findByText('共 2 筆')
    expect(await screen.findByLabelText('選取 王小美')).toBeInTheDocument()
    cleanup()

    setup({ rakeAuthority: false })
    await screen.findByText('共 2 筆')
    expect(screen.queryByLabelText('選取 王小美')).toBeNull()
    expect(screen.queryByLabelText('全選')).toBeNull()
  })
})
