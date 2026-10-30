// 保護店家前台「抽獎資格登錄」（發抽獎券，/customer/send-event-ticket/:id）：標題顯示店名；電話、張數只收數字；
// 電話離開欄位時查詢是否為既有顧客，既有顧客帶入姓名並鎖定；送出前檢查電話 5–20 碼、張數必填且不超過 500；
// 送出以 POST 打同一個後端的 /outer_store/send_event_ticket，body 為 { name, cellphone, count, merchantId }；
// 以 res.ok 判斷成功：後端 400 顯示其訊息、其他非 2xx 顯示發券失敗，成功顯示發券成功並清空表單（店名保留）；「資料建立中」提示不可被點掉。fetch 以假函式代替，不連後端、不發真實抽獎券。
import React from 'react'
import CustomizedSnackbars, { openSnackbar } from 'elements/snackbars'
jest.mock('elements/snackbars', () => {
  const actual = jest.requireActual('elements/snackbars')
  return { __esModule: true, ...actual, openSnackbar: jest.fn(actual.openSnackbar) }
})
beforeEach(() => openSnackbar.mockImplementation(jest.requireActual('elements/snackbars').openSnackbar))
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { getApiOrigin } from 'lib/api-base'
import { httpStatusMessage } from 'lib/friendly-error'
import { renderPage, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerSendEventTicket from '..'

jest.setTimeout(20000)

const setup = (fixtures = {}) =>
  renderPage(
    <>
      <CustomizedSnackbars />
      <CustomerSendEventTicket />
    </>,
    {
      fixtures: {
        GET_MERCHANT_NAME: { getMerchantName: '信義店' },
        CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: true, customerName: '陳小姐' } },
        ...fixtures,
      },
      path: '/customer/send-event-ticket/:id',
      route: '/customer/send-event-ticket/merchant-9',
    }
  )

const phone = () => screen.getByLabelText(/^電話/)
const count = () => screen.getByLabelText(/^張數/)
const name = () => screen.getByLabelText(/^姓名/)
const submit = () => screen.getByRole('button', { name: '提交' })
const mockFetch = impl => {
  const fn = jest.fn(impl)
  window.fetch = fn
  global.fetch = fn
  return fn
}
const clickAway = async () => {
  await new Promise(resolve => setTimeout(resolve, 10))
  fireEvent.click(document.body)
}

const closeToast = async text => {
  fireEvent.click(screen.getByRole('button', { name: '關閉' }))
  await wait(() => expect(screen.queryByText(text)).toBeNull())
}

afterEach(cleanup)

describe('抽獎資格登錄', () => {
  it('標題顯示店名；電話、張數只收數字；離開電話欄查詢既有顧客並帶入、鎖定姓名', async () => {
    const utils = setup()
    expect(await screen.findByText('信義店 抽獎資格登錄')).toBeInTheDocument()
    expect(callsOf(utils.calls, 'GET_MERCHANT_NAME')[0].variables).toEqual({ input: 'merchant-9' })
    fireEvent.change(phone(), { target: { value: '09a' } })
    expect(phone()).toHaveValue('')
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(count(), { target: { value: '3x' } })
    expect(count()).toHaveValue('1')
    fireEvent.change(count(), { target: { value: '0' } })
    expect(count()).toHaveValue('')
    fireEvent.change(count(), { target: { value: '3' } })
    expect(submit()).toBeDisabled()
    fireEvent.focusOut(phone())
    await wait(() => expect(name()).toHaveValue('陳小姐'))
    expect(callsOf(utils.calls, 'CHECK_IS_CUSTOMER_EXIST')[0].variables).toEqual({
      input: { cellphone: '0912345678', storeId: 'merchant-9' },
    })
    expect(name()).toBeDisabled()
    expect(submit()).not.toBeDisabled()
  })

  it('新顧客：姓名可自行輸入（查詢回的姓名不帶入）', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: '不應帶入' } } })
    await screen.findByText('信義店 抽獎資格登錄')
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.focusOut(phone())
    await wait(() => expect(name()).not.toBeDisabled())
    expect(name()).toHaveValue('')
    // 姓名空白時提交鈕停用並說明原因（STYLE.md §6）
    expect(screen.getByText('尚缺：姓名')).toHaveAttribute('role', 'status')
    fireEvent.change(name(), { target: { value: '林先生' } })
    expect(name()).toHaveValue('林先生')
    expect(screen.queryByText('尚缺：姓名')).toBeNull()
  })

  it('既有顧客但後端沒有姓名時以空白帶入', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: true, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.focusOut(phone())
    await wait(() => expect(name().value).toBe(''))
    expect(name()).toBeDisabled()
  })

  it('送出前檢查電話格式、張數必填與上限，不呼叫後端', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    const fetchFn = mockFetch(() => Promise.resolve({ ok: true, status: 200 }))
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.change(phone(), { target: { value: '1234' } })
    fireEvent.click(submit())
    expect(await screen.findByText('電話格式有誤: 請輸入5-20碼的數字。')).toBeInTheDocument()
    await closeToast('電話格式有誤: 請輸入5-20碼的數字。')
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(count(), { target: { value: '' } })
    fireEvent.click(submit())
    expect(await screen.findByText('張數為必填欄位')).toBeInTheDocument()
    await closeToast('張數為必填欄位')
    fireEvent.change(count(), { target: { value: '501' } })
    fireEvent.click(submit())
    expect(await screen.findByText('單次發券張數不可超過500張')).toBeInTheDocument()
    expect(fetchFn).not.toHaveBeenCalled()
  })

  // 錯誤提示還開著時再按「提交」，新的錯誤提示不再被同一次點擊的「點外面關閉」關掉
  // 全域提示不因點擊背景關閉，改由關閉鈕關閉。
  it('上一個錯誤提示未關閉時再提交，新的錯誤提示照常顯示', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.change(phone(), { target: { value: '1234' } })
    fireEvent.click(submit())
    expect(await screen.findByText('電話格式有誤: 請輸入5-20碼的數字。')).toBeInTheDocument()
    await new Promise(resolve => setTimeout(resolve, 10))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(count(), { target: { value: '' } })
    fireEvent.click(submit())
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(screen.getByText('張數為必填欄位')).toBeInTheDocument()
    await closeToast('張數為必填欄位')
  })

  it('送出成功：POST 正確內容、顯示發券成功並清空表單；按關閉鈕關閉提示', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    const fetchFn = mockFetch(() => Promise.resolve({ ok: true, status: 200 }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(count(), { target: { value: '500' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('發券成功')).toBeInTheDocument()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '發券成功', variant: 'success' })
    expect(fetchFn).toHaveBeenCalledWith(`${getApiOrigin()}/outer_store/send_event_ticket`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '林先生', cellphone: '0912345678', count: 500, merchantId: 'merchant-9' }),
    })
    expect(phone()).toHaveValue('')
    expect(count()).toHaveValue('1')
    expect(name()).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    await wait(() => expect(screen.queryByText('發券成功')).toBeNull())
  })

  // 發券成功清空表單時保留查回的店名（原本寫死成「測試店家」；Jason 2026/10/22 fix all）
  it('發券成功後標題仍是查回的店名', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ ok: true, status: 200 }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('發券成功')).toBeInTheDocument()
    expect(openSnackbar).toHaveBeenCalledWith({ message: '發券成功', variant: 'success' })
    expect(screen.getByText('信義店 抽獎資格登錄')).toBeInTheDocument()
    expect(screen.queryByText(/測試店家/)).toBeNull()
  })

  it('後端回 400：顯示後端訊息，不清空表單', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve('今日發券已達上限') }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('今日發券已達上限')).toBeInTheDocument()
    expect(phone()).toHaveValue('0912345678')
    expect(submit()).not.toBeDisabled()
  })

  // 以 res.ok 判斷成功：500、403 等非 2xx 顯示發券失敗、不清空表單（原本只把 400 當失敗；Jason 2026/10/22 fix all）
  it.each([500, 403])('後端回 %s：顯示發券失敗、不清空表單、可再按', async status => {
    const message = `發券失敗：${httpStatusMessage(status)}`
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ status, ok: false }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.queryByText('發券成功')).toBeNull()
    expect(phone()).toHaveValue('0912345678')
    expect(name()).toHaveValue('林先生')
    expect(submit()).not.toBeDisabled()
  })

  it('送出中顯示「資料建立中請稍候」，點畫面其他地方也不關閉；網路錯誤顯示錯誤訊息', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    let fail
    mockFetch(
      () =>
        new Promise((resolve, reject) => {
          fail = reject
        })
    )
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('資料建立中請稍候')).toBeInTheDocument()
    await clickAway()
    expect(screen.getByText('資料建立中請稍候')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(screen.queryByText('資料建立中請稍候')).toBeNull()
    fail(new Error('Failed to fetch'))
    expect(await screen.findByText('網路連線異常，請檢查網路後再試一次')).toBeInTheDocument()
  })

  // 店名查詢失敗時店名留空、不整頁錯誤（原本 effect 讀 data.getMerchantName 拋錯；Jason 2026/10/22 fix all）
  it('店名查詢失敗：店名留空，表單仍可使用', async () => {
    const utils = setup({ GET_MERCHANT_NAME: new Error('查無店家') })
    await utils.settle()
    expect(screen.queryByText(PAGE_CRASH_TEXT)).not.toBeInTheDocument()
    expect(screen.getByRole('heading').textContent).toBe('  抽獎資格登錄')
    expect(phone()).toBeInTheDocument()
  })
})

it('建立中提示遵循全域 3 秒時限；較慢的請求完成後仍顯示成功提示', async () => {
  setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
  await screen.findByText('信義店 抽獎資格登錄')
  let finish
  mockFetch(
    () =>
      new Promise(resolve => {
        finish = resolve
      })
  )
  fireEvent.change(phone(), { target: { value: '0912345678' } })
  fireEvent.change(name(), { target: { value: '林先生' } })
  fireEvent.click(submit())
  expect(openSnackbar).toHaveBeenCalledWith({ message: '資料建立中請稍候', variant: 'warning' })
  expect(await screen.findByText('資料建立中請稍候')).toBeInTheDocument()
  await wait(() => expect(screen.queryByText('資料建立中請稍候')).toBeNull(), { timeout: 8000 })
  finish({ ok: true, status: 200 })
  expect(await screen.findByText('發券成功')).toBeInTheDocument()
  expect(openSnackbar).toHaveBeenLastCalledWith({ message: '發券成功', variant: 'success' })
})
