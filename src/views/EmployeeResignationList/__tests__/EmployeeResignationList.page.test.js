// 保護「員工離職列表」：列出離職員工（姓名、手機、編號、暱稱、離職日期以台灣日期顯示）；
// 勾選後「員工復職」送出的 userIds 必須是勾選的員工，後端回 true 才提示成功並重抓列表，回 false 提示失敗、錯誤顯示後端訊息。
// GraphQL 全由模擬 link 回應，不連後端、不改真實員工資料。
import React from 'react'
import { cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, USER_ID } from '../../../__tests__/testkit.test'
import EmployeeResignationList from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const RESIGNED = [
  {
    id: 'u1',
    lastName: '王',
    firstName: '小美',
    cellphone: '0911000111',
    designerNo: 'A01',
    nickName: 'Amy',
    avatar: null,
    deletedAt: new Date(2026, 8, 30, 23, 30).getTime(),
  },
  {
    id: 'u2',
    lastName: '林',
    firstName: '大明',
    cellphone: '0922000222',
    designerNo: 'A02',
    nickName: '',
    avatar: null,
    deletedAt: new Date(2026, 9, 1, 0, 10).getTime(),
  },
]

const setup = (fixtures = {}) =>
  renderPage(<EmployeeResignationList />, {
    route: '/management/employee/resignation',
    fixtures: {
      DESIGNER: { merchantDesigner: { id: USER_ID, merchantIdentity: { authorityName: '店長' } } },
      GET_EMPLOYEE_RESIGNATION_LIST: { getEmployeeResignationList: RESIGNED },
      ...fixtures,
    },
  })

const reinstate = () => fireEvent.click(screen.getByRole('button', { name: '員工復職' }))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('員工離職列表', () => {
  it('列出離職員工與離職日期（台灣日期）', async () => {
    const { calls } = setup()
    expect(await screen.findByText('共 2 筆')).toBeInTheDocument()
    const amy = within(screen.getByText('王小美').closest('tr'))
    expect(amy.getByText('0911000111')).toBeInTheDocument()
    expect(amy.getByText('A01')).toBeInTheDocument()
    expect(amy.getByText('Amy')).toBeInTheDocument()
    expect(amy.getByText('2026/09/30')).toBeInTheDocument()
    expect(within(screen.getByText('林大明').closest('tr')).getByText('2026/10/01')).toBeInTheDocument()
    expect(callsOf(calls, 'DESIGNER')[0].variables).toEqual({ designerId: USER_ID })
  })

  it('全選後復職：送出全部員工 id，後端回 true 提示成功並重抓列表', async () => {
    const { calls } = setup({ SET_CREATE_RESIGNED_USER: { createResignedUser: true } })
    await screen.findByText('共 2 筆')
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByText('已選 2 筆')).toBeInTheDocument()
    const before = callsOf(calls, 'GET_EMPLOYEE_RESIGNATION_LIST').length
    reinstate()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '更改成功', variant: 'success' }))
    expect(callsOf(calls, 'SET_CREATE_RESIGNED_USER')[0].variables).toEqual({ userIds: ['u1', 'u2'] })
    await wait(() => expect(callsOf(calls, 'GET_EMPLOYEE_RESIGNATION_LIST').length).toBeGreaterThan(before))
  })

  it('逐一勾選／取消：只送出仍勾選的員工；後端回 false 提示失敗', async () => {
    const { calls } = setup({ SET_CREATE_RESIGNED_USER: { createResignedUser: false } })
    await screen.findByText('共 2 筆')
    // 全選再取消全選
    fireEvent.click(screen.getByLabelText('全選'))
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('選取 王小美')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 王小美'))
    fireEvent.click(screen.getByLabelText('選取 林大明'))
    expect(screen.getByLabelText('全選')).toBeChecked()
    fireEvent.click(screen.getByLabelText('選取 王小美'))
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    reinstate()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '更改失敗', variant: 'error' }))
    expect(callsOf(calls, 'SET_CREATE_RESIGNED_USER')[0].variables).toEqual({ userIds: ['u2'] })
  })

  it('復職失敗時顯示後端訊息', async () => {
    setup({ SET_CREATE_RESIGNED_USER: new Error('員工手機已被使用') })
    await screen.findByText('共 2 筆')
    fireEvent.click(screen.getByLabelText('選取 王小美'))
    reinstate()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '員工手機已被使用', variant: 'error' }))
  })
})
