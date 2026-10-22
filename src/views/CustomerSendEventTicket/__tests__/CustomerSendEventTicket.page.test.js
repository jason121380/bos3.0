// 保護店家前台「抽獎資格登錄」（發抽獎券，/customer/send-event-ticket/:id）：標題顯示店名；電話、張數只收數字；
// 電話離開欄位時查詢是否為既有顧客，既有顧客帶入姓名並鎖定；送出前檢查電話 5–20 碼、張數必填且不超過 500；
// 送出以 POST 打同一個後端的 /outer_store/send_event_ticket，body 為 { name, cellphone, count, merchantId }；
// 後端 400 顯示其訊息、成功顯示發券成功並清空表單；「資料建立中」提示不可被點掉。fetch 以假函式代替，不連後端、不發真實抽獎券。
import React from 'react'
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { getApiOrigin } from 'lib/api-base'
import { renderPage, callsOf, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import CustomerSendEventTicket from '..'

jest.setTimeout(20000)

const setup = (fixtures = {}) =>
  renderPage(<CustomerSendEventTicket />, {
    fixtures: {
      GET_MERCHANT_NAME: { getMerchantName: '信義店' },
      CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: true, customerName: '陳小姐' } },
      ...fixtures,
    },
    path: '/customer/send-event-ticket/:id',
    route: '/customer/send-event-ticket/merchant-9',
  })

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
  await clickAway()
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
    fireEvent.change(name(), { target: { value: '林先生' } })
    expect(name()).toHaveValue('林先生')
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
    const fetchFn = mockFetch(() => Promise.resolve({ status: 200 }))
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

  // 已知缺口（待 Jason 決定）：錯誤提示還開著時再按「提交」，同一次點擊會被提示的「點外面關閉」接到，
  // 剛顯示的新錯誤提示立刻被關掉，使用者看不到第二個錯誤（views/CustomerSendEventTicket/index.js:43-49 的 closeSnackBar 用的是點擊前的訊息）。
  // 建議：提交時先關閉舊提示再顯示新提示，或 onClose 忽略 reason === 'clickaway'。
  it('已知缺口：上一個錯誤提示未關閉時再提交，新的錯誤提示被同一次點擊關掉', async () => {
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
    expect(screen.queryByText('張數為必填欄位')).toBeNull()
  })

  it('送出成功：POST 正確內容、顯示發券成功並清空表單；點畫面其他地方關閉提示', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    const fetchFn = mockFetch(() => Promise.resolve({ status: 200 }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(count(), { target: { value: '500' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('發券成功')).toBeInTheDocument()
    expect(fetchFn).toHaveBeenCalledWith(`${getApiOrigin()}/outer_store/send_event_ticket`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '林先生', cellphone: '0912345678', count: 500, merchantId: 'merchant-9' }),
    })
    expect(phone()).toHaveValue('')
    expect(count()).toHaveValue('1')
    expect(name()).toHaveValue('')
    await clickAway()
    await wait(() => expect(screen.queryByText('發券成功')).toBeNull())
  })

  // 已知缺口（待 Jason 決定）：發券成功後清空表單時把店名寫死成「測試店家」，標題從真實店名變成「測試店家 抽獎資格登錄」
  // （views/CustomerSendEventTicket/index.js:57）。建議：重設時保留 data.merchantName。
  it('已知缺口：發券成功後標題店名變成「測試店家」', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ status: 200 }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('測試店家 抽獎資格登錄')).toBeInTheDocument()
  })

  it('後端回 400：顯示後端訊息，不清空表單', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ status: 400, json: () => Promise.resolve('今日發券已達上限') }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('今日發券已達上限')).toBeInTheDocument()
    expect(phone()).toHaveValue('0912345678')
    expect(submit()).not.toBeDisabled()
  })

  // 已知缺口（待 Jason 決定）：只把 400 當失敗，其他非成功狀態（500、403…）一律顯示「發券成功」並清空表單
  // （views/CustomerSendEventTicket/index.js:90）。建議：以 res.ok 判斷，非 2xx 都顯示錯誤。
  it('已知缺口：後端回 500 仍顯示發券成功', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    mockFetch(() => Promise.resolve({ status: 500, ok: false }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('發券成功')).toBeInTheDocument()
  })

  it('送出中顯示「資料建立中請稍候」，點畫面其他地方也不關閉；網路錯誤顯示錯誤訊息', async () => {
    setup({ CHECK_IS_CUSTOMER_EXIST: { checkIsCustomerExistForOuterStore: { isExist: false, customerName: null } } })
    await screen.findByText('信義店 抽獎資格登錄')
    let fail
    mockFetch(() => new Promise((resolve, reject) => { fail = reject }))
    fireEvent.change(phone(), { target: { value: '0912345678' } })
    fireEvent.change(name(), { target: { value: '林先生' } })
    fireEvent.click(submit())
    expect(await screen.findByText('資料建立中請稍候')).toBeInTheDocument()
    await clickAway()
    expect(screen.getByText('資料建立中請稍候')).toBeInTheDocument()
    fail(new Error('Failed to fetch'))
    expect(await screen.findByText('Failed to fetch')).toBeInTheDocument()
  })

  // 已知缺口（待 Jason 決定）：店名查詢失敗時 data 為 undefined，effect 讀 .getMerchantName 拋錯，整頁進入錯誤畫面
  // （views/CustomerSendEventTicket/index.js:132）。建議：查詢失敗時店名留空。
  it('已知缺口：店名查詢失敗時整頁進入錯誤畫面', async () => {
    const utils = setup({ GET_MERCHANT_NAME: new Error('查無店家') })
    await utils.settle()
    expect(screen.getByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
  })
})
