// 保護「新增員工」：姓、名、手機都填才可新增；手機少於 7 碼擋下並提示（不送出）；
// 人員身分類別預設帶入店家設定的預設身分，選「未設定」或沒有身分時不送 jobPointId（避免把空字串當身分 id 送給後端）；
// 送出的 CREATE_USER input 必須是畫面上的姓名、手機與身分，成功後回員工列表、失敗顯示後端訊息並可再按。
// GraphQL 全由模擬 link 回應，不連後端、不建立真實員工。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import { renderPage, loginAs, callsOf, currentLocation, PAGE_CRASH_TEXT, typeLikeBrowser } from '../../../__tests__/testkit.test'
import EmployeeCreate from '..'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

const JOBS = [
  { id: 'job-1', jobTitle: '設計師', pointValue: 10, isDefaultValue: false },
  { id: 'job-2', jobTitle: '助理', pointValue: 5, isDefaultValue: true },
]

const setup = (fixtures = {}) =>
  renderPage(<EmployeeCreate />, {
    route: '/employee/create',
    fixtures: { MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: JOBS }, CREATE_USER: { createUser: true }, ...fixtures },
  })

// 欄位 onChange 在 produce 的 updater 內才讀 event.target.value，以瀏覽器相同的方式輸入（見 testkit typeLikeBrowser）
const fill = (label, value) => typeLikeBrowser(screen.getByLabelText(label), value)
const selectedText = select => select.options[select.selectedIndex].textContent
const pickJob = text => {
  const select = screen.getByLabelText('人員身分類別設定')
  const option = Array.from(select.options).find(o => o.textContent === text)
  fireEvent.change(select, { target: { value: option.value } })
}
const fillAll = (cellphone = '0912345678') => {
  fill('姓氏', '陳')
  fill('名字', '小華')
  fill('手機號碼', cellphone)
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: '新增' }))

beforeEach(() => loginAs())
afterEach(cleanup)

describe('新增員工', () => {
  it('姓、名、手機都填才能新增；預設帶入店家的預設身分並送出', async () => {
    const { calls, settle } = setup()
    await settle()
    const button = screen.getByRole('button', { name: '新增' })
    expect(button).toBeDisabled()
    expect(selectedText(screen.getByLabelText('人員身分類別設定'))).toBe('助理')
    fill('姓氏', '陳')
    fill('名字', '小華')
    expect(button).toBeDisabled()
    fill('手機號碼', '0912345678')
    expect(button).toBeEnabled()
    // 滾輪不會改到手機號碼（數字欄位滾動時先移開焦點）
    const phone = screen.getByLabelText('手機號碼')
    phone.focus()
    fireEvent.wheel(phone)
    expect(document.activeElement).not.toBe(phone)
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '成功新增員工', variant: 'success' }))
    expect(callsOf(calls, 'CREATE_USER')[0].variables.input).toEqual({
      firstName: '小華',
      lastName: '陳',
      cellphone: '0912345678',
      jobPointId: 'job-2',
    })
    expect(currentLocation()).toBe('/management/employee')
  })

  it('改選其他身分送出該身分；選「未設定」時不送 jobPointId', async () => {
    const { calls, settle } = setup()
    await settle()
    fillAll()
    pickJob('設計師')
    submit()
    await wait(() => expect(callsOf(calls, 'CREATE_USER')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_USER')[0].variables.input.jobPointId).toBe('job-1')
    cleanup()

    const second = setup()
    await second.settle()
    fillAll()
    pickJob('未設定')
    submit()
    await wait(() => expect(callsOf(second.calls, 'CREATE_USER')).toHaveLength(1))
    expect(callsOf(second.calls, 'CREATE_USER')[0].variables.input).not.toHaveProperty('jobPointId')
  })

  it('手機少於 7 碼：提示且不送出，按鈕恢復可按', async () => {
    const { calls, settle } = setup()
    await settle()
    fillAll('091234')
    submit()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '手機長度必須大於六碼', variant: 'warning' })
    expect(callsOf(calls, 'CREATE_USER')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled()
  })

  it('店家沒有任何身分設定時只有「未設定」，送出不帶 jobPointId', async () => {
    const { calls, settle } = setup({ MERCHANT_JOBTITLE_POINT: { merchantJobTitlePoint: [] } })
    await settle()
    fillAll()
    submit()
    await wait(() => expect(callsOf(calls, 'CREATE_USER')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_USER')[0].variables.input).not.toHaveProperty('jobPointId')
  })

  it('後端拒絕時顯示後端訊息，停在本頁且可再按', async () => {
    const { calls, settle } = setup({ CREATE_USER: new Error('手機號碼已存在') })
    await settle()
    fillAll()
    submit()
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '手機號碼已存在', variant: 'error' }))
    expect(callsOf(calls, 'CREATE_USER')).toHaveLength(1)
    expect(currentLocation()).toBe('/employee/create')
    expect(screen.getByRole('button', { name: '新增' })).toBeEnabled()
  })

  // 人員身分查詢失敗時以空清單處理（只有「未設定」），仍可新增員工、不送 jobPointId（Jason 2026/10/22；修正前整頁錯誤）。
  it('人員身分查詢失敗時只有「未設定」，仍可新增', async () => {
    const { calls, settle } = setup({ MERCHANT_JOBTITLE_POINT: new Error('網路錯誤') })
    await settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
    // 與「店家沒有任何身分設定」相同：除了「未設定」只有一個空白選項
    expect(Array.from(screen.getByLabelText('人員身分類別設定').options).map(o => o.textContent).filter(Boolean)).toEqual(['未設定'])
    fillAll()
    submit()
    await wait(() => expect(callsOf(calls, 'CREATE_USER')).toHaveLength(1))
    expect(callsOf(calls, 'CREATE_USER')[0].variables.input).not.toHaveProperty('jobPointId')
  })
})
