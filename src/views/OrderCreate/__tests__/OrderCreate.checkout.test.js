// 保護打帳單頁首與結帳列的櫃台流程：
// - 結帳成功後導到帳單列表；開「連續打單結帳」時改為清空整張帳單（含服務人員、品項、顧客）留在本頁，下一張帳單換新的防重複檢查碼
// - 開「結帳前確認明細」時按結帳先開明細、不直接送出；這兩個選項記在本機，取消勾選即清除
// - 店販／會員卡列缺服務人員或品項時，結帳與掛單都擋下並說明缺什麼，不送出
// - 掛單成功導到掛單列表、失敗提示錯誤；送出中按鈕停用並說明「處理中」
// - 指定方式：店家設定「不指定」時預設不指定；點選或用方向鍵切換；服務人員欄按 Enter 跳到指定方式
// - 帳單日期：可從日期選擇器改日期；店家開啟「鎖定日期」時可鎖定，下次開啟沿用鎖定的日期，取消鎖定改回現在
// - 帳單速查：從頁首開啟當日帳單速查
// GraphQL 全由模擬 link 回應，不建立真實帳單。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import format from 'date-fns/format'
import { openSnackbar } from 'elements/snackbars'
import { loginAs, callsOf, currentLocation } from '../../../__tests__/testkit.test'
import {
  setupPage, waitPageReady, pickEmployee, pickService, pickCustomer, checkoutButton, sentOrder,
  DESIGNER, PRODUCT, MEMBERSHIP, MEMBERSHIP_FOREVER, button, queryButton, findButton,
} from './orderCreateKit.test'

jest.setTimeout(20000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))

beforeEach(() => {
  loginAs()
})
afterEach(cleanup)

const withoutCustomer = () => fireEvent.click(screen.getByLabelText('不留客資'))
const fillMinimal = async () => {
  await pickEmployee()
  withoutCustomer()
  await pickService()
  await wait(() => expect(checkoutButton()).not.toBeDisabled())
}
// 掛單前的確認對話框（openSnackbar 的 orderPending 參數）；不用「最後一次提示」，避免上一個測試晚到的提示混進來
const pendingConfirm = () => [...openSnackbar.mock.calls].reverse().find(([arg]) => arg.orderPending)[0]
const shownTimes = message => openSnackbar.mock.calls.filter(([arg]) => arg.message === message).length
const designerInputs = () => screen.getAllByPlaceholderText('服務人員姓名/編號')

describe('打帳單：結帳後', () => {
  it('一般模式：結帳成功後導到帳單列表', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })

  it('連續打單結帳：結帳成功後清空帳單留在本頁，下一張以新的檢查碼送出', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    const stay = screen.getByLabelText('連續打單結帳')
    fireEvent.click(stay)
    expect(stay).toBeChecked()
    expect(JSON.parse(localStorage.getItem('stayInCreateOrder'))).toBe(true)

    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    const firstCode = sentOrder(calls).checkCodeFromFE
    // 清空：服務人員、服務列回到空白；停在打帳單
    await wait(() => expect(designerInputs()[0]).toHaveValue(''))
    await wait(() => expect(screen.getByPlaceholderText('服務名稱/代號')).toHaveValue(''))
    expect(currentLocation()).toBe('/order/create')
    // 「不留客資」記在本機，清空後維持勾選
    expect(screen.getByLabelText('不留客資')).toBeChecked()

    // 等清空完成（500ms 後恢復按鈕）再打下一張
    await pickEmployee()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled(), { timeout: 3000 })
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(2))
    expect(sentOrder(calls, 1).checkCodeFromFE).not.toBe(firstCode)
    expect(sentOrder(calls, 1).serviceOrders).toHaveLength(1)
  })

  it('取消勾選連續打單結帳：清除本機記住的設定', async () => {
    localStorage.setItem('stayInCreateOrder', true)
    setupPage()
    await waitPageReady()
    const stay = screen.getByLabelText('連續打單結帳')
    expect(stay).toBeChecked()
    fireEvent.click(stay)
    expect(stay).not.toBeChecked()
    expect(localStorage.getItem('stayInCreateOrder')).toBeNull()
  })

  it('結帳前確認明細：勾選後按結帳先開明細、不直接送出；取消勾選清除本機設定', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    const confirm = screen.getByLabelText('結帳前確認明細')
    fireEvent.click(confirm)
    expect(confirm).toBeChecked()
    expect(JSON.parse(localStorage.getItem('stayInCheckOrderDetail'))).toBe(true)
    await fillMinimal()
    fireEvent.click(checkoutButton())
    expect(await findButton('結帳並列印')).toBeInTheDocument()
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)

    fireEvent.click(button('返回'))
    await wait(() => expect(queryButton('結帳並列印')).toBeNull())
    fireEvent.click(confirm)
    expect(confirm).not.toBeChecked()
    expect(localStorage.getItem('stayInCheckOrderDetail')).toBeNull()
  })

  it('上次勾選了結帳前確認明細：進入時維持勾選，取消後恢復直接結帳', async () => {
    localStorage.setItem('stayInCheckOrderDetail', true)
    const { calls } = setupPage()
    await waitPageReady()
    const confirm = screen.getByLabelText('結帳前確認明細')
    expect(confirm).toBeChecked()
    fireEvent.click(confirm)
    expect(confirm).not.toBeChecked()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
  })

  it('送出中：按鈕停用並顯示「處理中，請稍候」', async () => {
    const { calls } = setupPage({}, { delays: { FETCH_CREATE_ORDER: 400 } })
    await waitPageReady()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    expect(await screen.findByText('處理中，請稍候')).toBeInTheDocument()
    expect(checkoutButton()).toBeDisabled()
    expect(button('掛單')).toBeDisabled()
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    // 等送出完成再結束，避免回應晚到影響下一個測試
    await wait(() => expect(currentLocation()).toBe('/management/orders'))
  })
})

describe('打帳單：送出前逐列檢查', () => {
  // 店販第一列的服務人員／商品
  const productSeller = () => designerInputs()[1]
  const openPanel = name => fireEvent.click(screen.getByText(name))

  it('店販只選服務人員沒選商品：結帳與掛單都擋下並提示「請選擇店販商品」', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    withoutCustomer()
    openPanel('店販銷售')
    await pickEmployee(productSeller())
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(shownTimes('請選擇店販商品')).toBe(1))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '請選擇店販商品', variant: 'error' }))
    // 擋下後按鈕恢復
    await wait(() => expect(checkoutButton()).not.toBeDisabled())

    fireEvent.click(button('掛單'))
    pendingConfirm().usehandleCreateDraftOrder()
    await wait(() => expect(shownTimes('請選擇店販商品')).toBe(2))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('店販只選商品沒選服務人員：結帳與掛單都提示「請選擇店販的服務人員」', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    withoutCustomer()
    openPanel('店販銷售')
    fireEvent.change(screen.getByPlaceholderText('商品代號/名稱'), { target: { value: '洗' } })
    fireEvent.click(await screen.findByTestId(`undefined-${PRODUCT.name}`))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(shownTimes('請選擇店販的服務人員')).toBe(1))
    await wait(() => expect(button('掛單')).not.toBeDisabled())
    fireEvent.click(button('掛單'))
    pendingConfirm().usehandleCreateDraftOrder()
    await wait(() => expect(shownTimes('請選擇店販的服務人員')).toBe(2))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('會員卡只選服務人員沒選卡：結帳與掛單提示「請選擇會員卡」', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    withoutCustomer()
    openPanel('會員卡銷售')
    // 頁首、店販、會員卡各一個服務人員欄位
    await pickEmployee(designerInputs()[2])
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(shownTimes('請選擇會員卡')).toBe(1))
    await wait(() => expect(button('掛單')).not.toBeDisabled())
    fireEvent.click(button('掛單'))
    pendingConfirm().usehandleCreateDraftOrder()
    await wait(() => expect(shownTimes('請選擇會員卡')).toBe(2))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  it('會員卡只選卡沒選服務人員：提示「請選擇會員卡的服務人員」', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    withoutCustomer()
    openPanel('會員卡銷售')
    fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '金' } })
    fireEvent.click(await screen.findByTestId(`undefined-${MEMBERSHIP.name}`))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(shownTimes('請選擇會員卡的服務人員')).toBe(1))
    await wait(() => expect(button('掛單')).not.toBeDisabled())
    fireEvent.click(button('掛單'))
    pendingConfirm().usehandleCreateDraftOrder()
    await wait(() => expect(shownTimes('請選擇會員卡的服務人員')).toBe(2))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })

  // 為什麼重要：終身卡（有效天數 0）沒有可帶的到期日。原本取消「永久會籍」時到期日＝帳單日＋0＝帳單日當天，
  // 已過期又早於日期欄可選的最早日期（帳單隔天），結帳與掛單照樣送出一張「當天就到期」的會員卡。
  // 改為到期日留空待櫃檯選，送出前以 checkMembershipOrders 擋下「會員卡到期日有誤」（同重新開單，Codex review PR #265）
  it('終身卡取消「永久會籍」：到期日留空，結帳與掛單提示「會員卡到期日有誤」不送出', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await pickEmployee()
    withoutCustomer()
    openPanel('會員卡銷售')
    await pickEmployee(designerInputs()[2])
    fireEvent.change(screen.getByPlaceholderText('會員卡名稱/代號'), { target: { value: '永' } })
    fireEvent.click(await screen.findByTestId(`undefined-${MEMBERSHIP_FOREVER.name}`))
    const forever = () => screen.getByLabelText('永久會籍')
    await wait(() => expect(forever()).toBeChecked())
    fireEvent.click(forever())
    await wait(() => expect(forever()).not.toBeChecked())
    expect(screen.getAllByLabelText(/^選擇日期/)[1]).toHaveValue('')
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(shownTimes('會員卡到期日有誤')).toBe(1))
    await wait(() => expect(button('掛單')).not.toBeDisabled())
    fireEvent.click(button('掛單'))
    pendingConfirm().usehandleCreateDraftOrder()
    await wait(() => expect(shownTimes('會員卡到期日有誤')).toBe(2))
    expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(0)
  })
})

describe('打帳單：掛單', () => {
  it('掛單成功：提示並導到掛單列表', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await fillMinimal()
    fireEvent.click(button('掛單'))
    act(() => pendingConfirm().usehandleCreateDraftOrder())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isPending).toBe(true)
    await wait(() => expect(currentLocation()).toBe('/management/draft-orders'))
    expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '掛單新增成功', variant: 'success' }))
  })

  it('掛單失敗：提示錯誤，按鈕恢復可再按', async () => {
    setupPage({ FETCH_CREATE_ORDER: new Error('網路暫斷') })
    await waitPageReady()
    await fillMinimal()
    const pending = button('掛單')
    fireEvent.click(pending)
    act(() => pendingConfirm().usehandleCreateDraftOrder())
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error', message: expect.stringContaining('網路暫斷') })))
    await wait(() => expect(pending).not.toBeDisabled())
    expect(currentLocation()).toBe('/order/create')
  })
})

describe('打帳單：指定方式', () => {
  const designate = () => button('指定')
  const nonDesignate = () => button('不指定')

  it('店家設定「不指定」：預設不指定，送出 isDesignate false', async () => {
    const { calls } = setupPage({ GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'NONDESIGNATE' } })
    await waitPageReady()
    await wait(() => expect(nonDesignate()).toHaveAttribute('aria-pressed', 'true'))
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isDesignate).toBe(false)
  })

  it('點選切換指定／不指定；再點一次已選的維持原選擇', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    fireEvent.click(nonDesignate())
    expect(nonDesignate()).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(nonDesignate())
    expect(nonDesignate()).toHaveAttribute('aria-pressed', 'true')
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isDesignate).toBe(false)
  })

  it('鍵盤：← 指定、→ 不指定、Enter 跳到服務項目；其他按鍵不變', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    fireEvent.keyDown(designate(), { keyCode: 39 })
    expect(nonDesignate()).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(nonDesignate(), { keyCode: 37 })
    expect(designate()).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(designate(), { keyCode: 65 })
    expect(designate()).toHaveAttribute('aria-pressed', 'true')
    await pickEmployee()
    fireEvent.keyDown(designate(), { keyCode: 13 })
    await wait(() => expect(screen.getByPlaceholderText('服務名稱/代號')).toHaveFocus())
    withoutCustomer()
    await pickService()
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isDesignate).toBe(true)
  })

  it('焦點在服務人員欄時第一次點「不指定」：就是不指定（不會被當成指定）', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    await fillMinimal()
    act(() => designerInputs()[0].focus())
    fireEvent.focus(designerInputs()[0])
    fireEvent.click(nonDesignate())
    expect(nonDesignate()).toHaveAttribute('aria-pressed', 'true')
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isDesignate).toBe(false)
  })

  it('服務人員欄按 Enter：焦點跳到目前選定的指定方式', async () => {
    setupPage()
    await waitPageReady()
    fireEvent.keyDown(designerInputs()[0], { key: 'Enter', keyCode: 13 })
    expect(designate()).toHaveFocus()
    fireEvent.click(nonDesignate())
    fireEvent.keyDown(designerInputs()[0], { key: 'Enter', keyCode: 13 })
    expect(nonDesignate()).toHaveFocus()
    // 其他按鍵不移動焦點
    designerInputs()[0].focus()
    fireEvent.keyDown(designerInputs()[0], { key: 'a', keyCode: 65 })
    expect(designerInputs()[0]).toHaveFocus()
  })
})

describe('打帳單：帳單日期', () => {
  const dateInput = () => screen.getByLabelText(/^選擇日期/)
  const today = new Date()
  const day15 = new Date(today.getFullYear(), today.getMonth(), 15)

  it('從日期選擇器改日期：送出的帳單日期是選的那天', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    fireEvent.click(dateInput())
    fireEvent.click(await screen.findByLabelText(format(day15, 'yyyy年M月d日')))
    fireEvent.click(button('確認'))
    await wait(() => expect(dateInput().value).toContain(format(day15, 'yyyy/MM/dd')))
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(format(new Date(sentOrder(calls).date), 'yyyy/MM/dd')).toBe(format(day15, 'yyyy/MM/dd'))
  })

  it('店家顯示「鎖定日期」：勾選後記住日期；下次打帳單沿用；取消鎖定改回現在', async () => {
    const fixtures = { GET_IS_LOCK_DATE_DISPLAY: { getIsDateLockDisplay: true }, GET_IS_LOCK_DATE: { getIsDateLock: true } }
    const first = setupPage(fixtures)
    await waitPageReady()
    fireEvent.click(dateInput())
    fireEvent.click(await screen.findByLabelText(format(day15, 'yyyy年M月d日')))
    fireEvent.click(button('確認'))
    const lock = await screen.findByLabelText('鎖定日期')
    fireEvent.click(lock)
    expect(JSON.parse(localStorage.getItem('lockDate'))).toBe(true)
    const locked = JSON.parse(localStorage.getItem('lockDateTimeStamp'))
    expect(format(new Date(locked), 'yyyy/MM/dd')).toBe(format(day15, 'yyyy/MM/dd'))
    first.unmount()

    // 重新進入：帳單日期沿用鎖定的日期，鎖定維持勾選
    const { calls } = setupPage(fixtures)
    await waitPageReady()
    expect(dateInput().value).toContain(format(day15, 'yyyy/MM/dd'))
    expect(screen.getByLabelText('鎖定日期')).toBeChecked()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).date).toBe(locked)
  })

  it('取消鎖定：清除記住的日期並改回現在', async () => {
    const locked = new Date(today.getFullYear(), today.getMonth(), 15, 10, 0).getTime()
    localStorage.setItem('lockDate', true)
    localStorage.setItem('lockDateTimeStamp', locked)
    setupPage({ GET_IS_LOCK_DATE_DISPLAY: { getIsDateLockDisplay: true } })
    await waitPageReady()
    const lock = screen.getByLabelText('鎖定日期')
    fireEvent.click(lock)
    expect(localStorage.getItem('lockDate')).toBeNull()
    expect(localStorage.getItem('lockDateTimeStamp')).toBeNull()
    await wait(() => expect(dateInput().value).toContain(format(today, 'yyyy/MM/dd')))
  })

  it('店家允許打帳單改日期時間時不顯示「鎖定日期」', async () => {
    setupPage({
      GET_IS_LOCK_DATE_DISPLAY: { getIsDateLockDisplay: true },
      GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER: { getIsAbleToChangeDateTimeInOrderCreate: true },
    })
    await waitPageReady()
    expect(screen.queryByLabelText('鎖定日期')).toBeNull()
  })
})

describe('打帳單：頁首資訊', () => {
  it('帳單速查：開啟當日帳單速查', async () => {
    const { calls } = setupPage({ FETCH_ORDERS_FOR_FAST_CHECK: { orders: { orders: [], intervalSummary: {} } } })
    await waitPageReady()
    fireEvent.click(button('帳單速查'))
    await wait(() => expect(callsOf(calls, 'FETCH_ORDERS_FOR_FAST_CHECK')).toHaveLength(1))
    expect(screen.getAllByText('帳單速查').length).toBeGreaterThan(1)
  })

  it('還沒有上一筆帳單（編號 0）時不顯示「上一筆帳單」', async () => {
    setupPage({ GET_LAST_ORDER_STATUS: { getLatestOrderStatus: { orderNo: 0, isDesignate: false } } })
    await wait(() => expect(button('指定')).not.toBeDisabled())
    expect(screen.queryByText(/上一筆帳單/)).toBeNull()
  })

  it('服務人員在頁首選定後，頁首服務人員顯示其暱稱與編號', async () => {
    setupPage()
    await waitPageReady()
    await pickEmployee()
    expect(designerInputs()[0]).toHaveValue(`${DESIGNER.userNickName}-${DESIGNER.userNo}`)
  })
})

describe('打帳單：連續打單與載入失敗', () => {
  it('連續打單＋鎖定日期＋有顧客：結帳後清空顧客與使用預收卡，帳單日期維持鎖定的日期', async () => {
    const locked = new Date(2026, 0, 5, 10, 0).getTime()
    localStorage.setItem('lockDate', true)
    localStorage.setItem('lockDateTimeStamp', locked)
    localStorage.setItem('stayInCreateOrder', true)
    const { calls } = setupPage({
      GET_TICKET_RECORDS_FOR_ORDERS_V2: {
        ticketRecordsForOrderV2: [
          { ticketName: '護髮五次卡', remark: '', price: 1000, ticketRecordForOrder: [{ id: 'tr-3', no: '3', name: '護髮五次卡', price: 1000, remark: '', helperSetting: [] }] },
        ],
      },
    })
    await waitPageReady()
    await pickCustomer(calls)
    await pickEmployee()
    fireEvent.click(screen.getByTestId('panelCouponUse'))
    fireEvent.click(screen.getByPlaceholderText('卡券代號/名稱'))
    fireEvent.click(await screen.findByTestId('-護髮五次卡'))
    await wait(() => expect(checkoutButton()).not.toBeDisabled())
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).date).toBe(locked)
    // 清空：顧客、服務人員、使用預收卡的列都回到空白
    await wait(() => expect(screen.getByPlaceholderText('顧客姓名/手機號碼/編號')).toHaveValue(''))
    expect(designerInputs()[0]).toHaveValue('')
    expect(screen.queryByText('x1')).toBeNull()
    expect(screen.getByLabelText(/^選擇日期/).value).toContain('2026/01/05')
  })

  it('店家設定「依上一筆」但上一筆帳單查詢失敗：頁面照常可打單，不顯示上一筆帳單', async () => {
    const { calls } = setupPage({
      GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'LAST' },
      GET_LAST_ORDER_STATUS: new Error('查詢失敗'),
    })
    await wait(() => expect(button('指定')).not.toBeDisabled())
    expect(screen.queryByText(/上一筆帳單/)).toBeNull()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
  })

  it('點「指定」：改回指定並以 isDesignate true 送出', async () => {
    const { calls } = setupPage({ GET_DESIGNATION_SETTING_FOR_ORDER_CREATE: { getDesignationSettingForOrderCreate: 'NONDESIGNATE' } })
    await waitPageReady()
    fireEvent.click(button('指定'))
    expect(button('指定')).toHaveAttribute('aria-pressed', 'true')
    expect(button('指定')).toHaveFocus()
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(sentOrder(calls).isDesignate).toBe(true)
  })
})

describe('打帳單：桌機的日期欄（可直接打字）', () => {
  let matchMedia
  beforeEach(() => {
    matchMedia = window.matchMedia
    // 桌機（滑鼠）：日期欄是可逐段輸入的欄位
    window.matchMedia = jest.fn(() => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }))
  })
  afterEach(() => {
    window.matchMedia = matchMedia
  })

  it('刪掉日期的一段（日期不完整）：帳單日期維持原本的日期，送出的不是無效日期', async () => {
    const { calls } = setupPage()
    await waitPageReady()
    // 帳單日期欄（頁面上唯一的逐段輸入日期欄）
    const date = document.querySelector('input[inputmode="numeric"]')
    const before = date.value
    act(() => date.focus())
    fireEvent.keyDown(date, { key: 'Backspace' })
    await wait(() => expect(date.value).not.toBe(before))
    await fillMinimal()
    fireEvent.click(checkoutButton())
    await wait(() => expect(callsOf(calls, 'FETCH_CREATE_ORDER')).toHaveLength(1))
    expect(Number.isNaN(sentOrder(calls).date)).toBe(false)
    expect(format(new Date(sentOrder(calls).date), 'yyyy/MM/dd HH:mm')).toBe(before)
  })
})
