// 保護：帳單頁與報表的「顧客」「服務人員」搜尋下拉。
// 顧客：打字停 600ms 才查詢（避免每個字都打後端）、打完整會員編號只列該位、打電話後按 Enter 直接帶入第一位並把焦點移到服務人員、
//       清除回傳 { id: '' }（帳單頁以此判斷未選顧客）、無顧客／已開單時停用。
// 被互助設計師（互助明細表）：打完整代號只列該位，其餘列全部；預約紀錄的人員清單（另一支查詢）規則同服務人員。
// 服務人員：代號完全相同優先，再列暱稱、姓名包含的（不重複）；顯示「暱稱或姓名-代號」，沒代號顯示（無代號）；
//       選項載入通知、getCustomerData 拿到全部人員。
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import React from 'react'

import { callsOf, loginAs, renderPage } from '__tests__/testkit.test'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import DesignerBeenAssistedAutoComplete from 'components/DesignerBeenAssistedAutoComplete'
import BookingRecordListAutoComplete from 'components/BookingRecordListAutoComplete'

afterEach(cleanup)
// 顧客下拉打字停 600ms 才查詢（真實計時）：全套測試多個 Jest 程序同時執行時，等待查詢回來可能超過 4 秒
//（2026/10/22 全套高負載下兩個測試逾時、單獨跑都通過），等待上限放寬，邏輯斷言不變
const DEBOUNCED_QUERY_TIMEOUT = 12000

const combo = () => screen.getByRole('combobox')
const openCombo = () => fireEvent.click(combo())
const optionTexts = () => screen.queryAllByRole('option').map(o => o.textContent)
const type = text => fireEvent.change(combo(), { target: { value: text } })
// 服務人員選項是 <div role="option">，這版 testing-library 算不出它的名稱，改以文字找
const optionByText = text => screen.getAllByRole('option').find(o => o.textContent === text)

describe('CustomerAutoComplete 顧客', () => {
  const customers = [
    { id: 'c1', name: '王小明', cellphone: '0912345678', no: 'A001' },
    { id: 'c2', name: '陳美麗', cellphone: '0922333444', no: null },
    { id: 'c3', name: '林大同', cellphone: '0912000111', no: 'A002' },
  ]
  // 模擬後端：有 customerId 時回該位；否則依關鍵字比對姓名、電話、編號
  const fixtures = {
    FETCH_CUSTOMERS_IN_AUTO_COMPLETE: ({ input }) => ({
      customers: {
        customers: input.customerId
          ? customers.filter(c => c.id === input.customerId)
          : customers.filter(c => !input.keyword || [c.name, c.cellphone, c.no].some(v => v && v.includes(input.keyword))),
      },
    }),
  }

  function Controlled({ initial = '', onPicked = () => {}, ...props }) {
    const [value, setValue] = React.useState(initial)
    return (
      <CustomerAutoComplete
        {...props}
        value={value}
        onChange={c => {
          onPicked(c)
          setValue(c.id)
        }}
      />
    )
  }

  beforeEach(() => loginAs())

  it('已選顧客以 id 查詢並顯示「姓名/電話/編號」；載入狀態通知 setCustomerAlready', async () => {
    const ready = jest.fn()
    const { settle, calls } = renderPage(<Controlled initial="c1" setCustomerAlready={ready} label="顧客" />, { fixtures })
    await settle()
    expect(callsOf(calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE')[0].variables.input).toEqual(
      expect.objectContaining({ merchantId: 'merchant-1', customerId: 'c1' })
    )
    expect(ready).toHaveBeenCalledWith(false)
    expect(ready).toHaveBeenLastCalledWith(true)
    await wait(() => expect(combo()).toHaveValue('王小明/0912345678/A001'))
  }, 20000)

  // 計時器與時鐘有誤差：600ms 的計時到期時，牆鐘可能只過了 599ms（2026/10/22 全套高負載下實測），
  // 原本比對牆鐘差 >= 600 會整個不查，櫃檯打完電話找不到人。這裡讓計時器提早到期，仍要以最後一次輸入查詢
  it('計時器比時鐘早到期：仍以最後一次輸入的關鍵字查詢', async () => {
    const realSetInterval = global.setInterval
    const spy = jest.spyOn(global, 'setInterval').mockImplementation((fn, ms, ...rest) => realSetInterval(fn, ms === 600 ? 0 : ms, ...rest))
    try {
      const inputOnChange = jest.fn()
      const { settle } = renderPage(<Controlled inputOnChange={inputOnChange} />, { fixtures })
      await settle()
      openCombo()
      type('09')
      type('0912')
      await wait(() => expect(inputOnChange).toHaveBeenCalledWith('0912'), { timeout: DEBOUNCED_QUERY_TIMEOUT })
      expect(inputOnChange).not.toHaveBeenCalledWith('09')
    } finally {
      spy.mockRestore()
    }
  }, 20000)

  it('打字停 600ms 才以關鍵字查詢並通知 inputOnChange；選項顯示「姓名 / 電話 / 編號」，選取回傳整筆', async () => {
    const inputOnChange = jest.fn()
    const picked = jest.fn()
    const { settle, calls } = renderPage(<Controlled inputOnChange={inputOnChange} onPicked={picked} />, { fixtures })
    await settle()
    const before = callsOf(calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').length
    openCombo()
    type('0912')
    expect(inputOnChange).not.toHaveBeenCalled()
    await wait(() => expect(inputOnChange).toHaveBeenCalledWith('0912'), { timeout: DEBOUNCED_QUERY_TIMEOUT })
    await settle()
    expect(callsOf(calls, 'FETCH_CUSTOMERS_IN_AUTO_COMPLETE').slice(before).map(c => c.variables.input.keyword)).toContain('0912')
    await wait(() => expect(optionTexts()).toEqual(['王小明 / 0912345678 / A001', '林大同 / 0912000111 / A002']))
    fireEvent.click(screen.getByRole('option', { name: '林大同 / 0912000111 / A002' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'c3' }))
  }, 20000)

  it('打完整會員編號：只列編號完全相同的那位', async () => {
    const { settle } = renderPage(<Controlled />, {
      fixtures: { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers } } },
    })
    await settle()
    openCombo()
    type('A002')
    await wait(() => expect(optionTexts()).toEqual(['林大同 / 0912000111 / A002']), { timeout: DEBOUNCED_QUERY_TIMEOUT })
  }, 20000)

  it('打電話後按 Enter：查詢回來自動帶入第一位，焦點移到服務人員欄；其他按鍵不觸發', async () => {
    const picked = jest.fn()
    const onKeyDown = jest.fn()
    const designerRef = { current: { focus: jest.fn() } }
    const { settle } = renderPage(<Controlled onPicked={picked} designerRef={designerRef} onKeyDown={onKeyDown} />, {
      fixtures,
      delays: { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: 20 },
    })
    await settle()
    type('0922')
    fireEvent.keyDown(combo(), { key: 'a', keyCode: 65 })
    fireEvent.keyDown(combo(), { key: 'Enter', keyCode: 13 })
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    expect(designerRef.current.focus).toHaveBeenCalledTimes(1)
    await wait(() => expect(picked).toHaveBeenCalledWith(expect.objectContaining({ id: 'c2' })), { timeout: DEBOUNCED_QUERY_TIMEOUT })
    await settle()
    expect(picked.mock.calls.every(([c]) => c.id === 'c2')).toBe(true)
  }, 20000)

  it('沒有會員編號的顧客只顯示「姓名/電話」', async () => {
    const { settle } = renderPage(<Controlled initial="c2" />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('陳美麗/0922333444'))
  }, 20000)

  it('按 Enter 但查無顧客時不帶入；沒有 designerRef 也不壞', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled onPicked={picked} />, {
      fixtures,
      delays: { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: 20 },
    })
    await settle()
    type('0999')
    fireEvent.keyDown(combo(), { key: 'Enter', keyCode: 13 })
    await wait(() => expect(screen.queryAllByRole('option')).toHaveLength(0), { timeout: DEBOUNCED_QUERY_TIMEOUT })
    await act(() => new Promise(resolve => setTimeout(resolve, 700)))
    await settle()
    expect(picked).not.toHaveBeenCalled()
  }, 20000)

  it('清除回傳 { id: "" }；無顧客（withoutCustomer）或已開單（orderAlready）時停用，已開單顯示載入圖示', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled initial="c1" onPicked={picked} />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('王小明/0912345678/A001'))
    type('')
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
    cleanup()
    renderPage(<CustomerAutoComplete withoutCustomer value="c1" />, { fixtures })
    expect(combo()).toBeDisabled()
    cleanup()
    const { container } = renderPage(<CustomerAutoComplete orderAlready />, { fixtures })
    expect(combo()).toBeDisabled()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  }, 20000)

  it('查詢失敗：沒有選項也不壞；沒給 onChange 時選取不拋錯', async () => {
    const { settle } = renderPage(<CustomerAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s2 } = renderPage(<CustomerAutoComplete />, {
      fixtures: { FETCH_CUSTOMERS_IN_AUTO_COMPLETE: { customers: { customers } } },
    })
    await s2()
    openCombo()
    expect(() => fireEvent.click(screen.getAllByRole('option')[0])).not.toThrow()
  }, 20000)
})

describe('EmployeeAutoComplete 服務人員', () => {
  const users = [
    { userId: 'u3', userName: '張三', userNickName: '小三', userNo: '3' },
    { userId: 'u1', userName: '李一', userNickName: '', userNo: '1' },
    { userId: 'u2', userName: '王二', userNickName: null, userNo: null },
    { userId: 'u4', userName: '三毛', userNickName: '阿毛', userNo: '' },
  ]
  const fixtures = { GET_USERS_ORDERABLE_LIST: { getUserOrderableList: users } }

  // 排序：Jason 2026/10/22 fix all 改為代號自然排序、空代號排最後（原本 a.userNo - b.userNo 把空代號當 0 排最前、英數代號無效）
  it('選項依代號自然排序（空代號排最後）；顯示暱稱或姓名＋代號，沒代號顯示（無代號）；載入通知、getCustomerData 拿到全部', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const { settle } = renderPage(<EmployeeAutoComplete setEmployeeAlready={ready} getCustomerData={getData} />, { fixtures })
    await settle()
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledWith(users.map(u => expect.objectContaining({ userId: u.userId })))
    openCombo()
    expect(optionTexts()).toEqual(['李一-1', '小三-3', '王二(無代號)', '阿毛(無代號)'])
    expect(screen.getByTestId('employee-李一')).toBeInTheDocument()
  })

  it('輸入：代號完全相同優先，再列暱稱、姓名包含的，不重複；只打空白列出全部', async () => {
    const inputOnChange = jest.fn()
    const { settle } = renderPage(<EmployeeAutoComplete inputOnChange={inputOnChange} />, { fixtures })
    await settle()
    openCombo()
    type('三')
    expect(inputOnChange).toHaveBeenLastCalledWith('三')
    expect(optionTexts()).toEqual(['小三-3', '阿毛(無代號)'])
    type('3')
    expect(optionTexts()).toEqual(['小三-3'])
    type('毛')
    expect(optionTexts()).toEqual(['阿毛(無代號)'])
    type('  ')
    expect(optionTexts()).toHaveLength(4)
  })

  it('以 userId 對回已選人員顯示「暱稱-代號」；選取回傳整筆、清除回傳 { id: "" }', async () => {
    function Controlled({ onPicked }) {
      const [value, setValue] = React.useState('u3')
      return (
        <EmployeeAutoComplete
          value={value}
          label="服務人員"
          onChange={u => {
            onPicked(u)
            setValue(u.userId)
          }}
        />
      )
    }
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled onPicked={picked} />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('小三-3'))
    openCombo()
    type('李')
    fireEvent.click(optionByText('李一-1'))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u1' }))
    await wait(() => expect(combo()).toHaveValue('李一-1'))
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
  })

  it('頁面沒把選取存回 value 時：以暱稱選到代號不含關鍵字的人員，欄位顯示其姓名（目前行為）', async () => {
    const { settle } = renderPage(<EmployeeAutoComplete />, { fixtures })
    await settle()
    openCombo()
    type('阿毛')
    fireEvent.click(optionByText('阿毛(無代號)'))
    expect(combo()).toHaveValue('三毛')
    type('3')
    fireEvent.click(optionByText('小三-3'))
    expect(combo()).toHaveValue('小三-3')
  })

  it('協助人員欄用 assistField 樣式；排班用半寬；表單送出（Enter）不重新整理頁面', async () => {
    const { container, settle } = renderPage(<EmployeeAutoComplete isAssist assistField="assist-cls" className="normal" schedule />, { fixtures })
    await settle()
    const root = container.querySelector('form').firstChild
    expect(root).toHaveClass('assist-cls')
    expect(root).not.toHaveClass('normal')
    expect(root.style.width).toBe('50%')
    const submit = new window.Event('submit', { bubbles: true, cancelable: true })
    container.querySelector('form').dispatchEvent(submit)
    expect(submit.defaultPrevented).toBe(true)
  })

  it('已選人員沒有代號：顯示「姓名(無代號)」；沒給 onKeyDown 時按鍵不拋錯', async () => {
    const { settle } = renderPage(<EmployeeAutoComplete value="u2" />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('王二(無代號)'))
    expect(() => fireEvent.keyDown(combo(), { key: 'a' })).not.toThrow()
  })

  it('查詢失敗不壞', async () => {
    const { settle } = renderPage(<EmployeeAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('DesignerBeenAssistedAutoComplete 被互助設計師', () => {
  const users = [
    { userId: 'u1', userName: '李一', userNickName: '', userNo: 'D1' },
    { userId: 'u2', userName: '王二', userNickName: '小王', userNo: null },
    { userId: 'u3', userName: '張三', userNickName: '阿三', userNo: 'D3' },
  ]
  const fixtures = { GET_USERS_ORDERABLE_LIST: { getUserOrderableList: users } }

  it('列出全部人員（暱稱或姓名＋代號）；打完整代號（不分大小寫）只列該位；通知 inputOnChange', async () => {
    const inputOnChange = jest.fn()
    const { settle } = renderPage(<DesignerBeenAssistedAutoComplete inputOnChange={inputOnChange} />, { fixtures })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual(['李一-D1', '小王(無代號)', '阿三-D3'])
    type('d3')
    expect(inputOnChange).toHaveBeenLastCalledWith('d3')
    expect(optionTexts()).toEqual(['阿三-D3'])
  })

  it('以 userId 對回已選人員；選取回傳整筆、清除回傳 { id: "" }；沒代號顯示（無代號）', async () => {
    function Controlled({ onPicked }) {
      const [value, setValue] = React.useState('u2')
      return (
        <DesignerBeenAssistedAutoComplete
          value={value}
          label="被互助設計師"
          onChange={u => {
            onPicked(u)
            setValue(u.userId)
          }}
        />
      )
    }
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled onPicked={picked} />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('小王(無代號)'))
    openCombo()
    fireEvent.click(optionByText('李一-D1'))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u1' }))
    await wait(() => expect(combo()).toHaveValue('李一-D1'))
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
  })

  // 已修正（Jason 2026/10/22 fix all）：原本用預設篩選（比對選項標籤），代號不含關鍵字時標籤是「姓名」，選單上顯示的暱稱（小王）打了找不到；
  // 改為比照 EmployeeAutoComplete：代號完全相同優先，再列暱稱、姓名包含的（不分大小寫、不重複），只打空白列出全部；
  // 原本打部分代號（d）可找到代號含該字的人，保留在最後（避免退步）
  it('可用暱稱、姓名或代號搜尋；頁面沒存回 value 時欄位顯示姓名；預設回呼不拋錯；查詢失敗不壞', async () => {
    const { settle } = renderPage(<DesignerBeenAssistedAutoComplete />, { fixtures })
    await settle()
    openCombo()
    type('小王')
    expect(optionTexts()).toEqual(['小王(無代號)'])
    type('阿')
    expect(optionTexts()).toEqual(['阿三-D3'])
    type('張')
    expect(optionTexts()).toEqual(['阿三-D3'])
    type('d')
    expect(optionTexts()).toEqual(['李一-D1', '阿三-D3'])
    type('  ')
    expect(optionTexts()).toHaveLength(3)
    type('王')
    expect(optionTexts()).toEqual(['小王(無代號)'])
    fireEvent.keyDown(combo(), { key: 'a' })
    fireEvent.click(optionByText('小王(無代號)'))
    expect(combo()).toHaveValue('王二')
    cleanup()
    const { settle: s2 } = renderPage(<DesignerBeenAssistedAutoComplete />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('BookingRecordListAutoComplete 預約紀錄人員', () => {
  const users = [
    { userId: 'u3', userName: '張三', userNickName: '小三', userNo: '3' },
    { userId: 'u1', userName: '李一', userNickName: '', userNo: '1' },
    { userId: 'u2', userName: '王二', userNickName: null, userNo: null },
  ]
  const fixtures = { GET_USER_BOOKING_RECORD_LIST: { getUserBookingRecordList: users } }

  // 排序：Jason 2026/10/22 fix all 改為代號自然排序、空代號排最後（原本空代號當 0 排最前）
  it('依代號排序列出（空代號排最後）；代號完全相同優先、再列暱稱與姓名包含的；載入通知、getCustomerData 拿到全部', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const inputOnChange = jest.fn()
    const { settle } = renderPage(
      <BookingRecordListAutoComplete setEmployeeAlready={ready} getCustomerData={getData} inputOnChange={inputOnChange} />,
      { fixtures }
    )
    await settle()
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledWith(users.map(u => expect.objectContaining({ userId: u.userId })))
    openCombo()
    expect(optionTexts()).toEqual(['李一-1', '小三-3', '王二(無代號)'])
    type('1')
    expect(inputOnChange).toHaveBeenLastCalledWith('1')
    expect(optionTexts()).toEqual(['李一-1'])
    type('三')
    expect(optionTexts()).toEqual(['小三-3'])
    type('王')
    expect(optionTexts()).toEqual(['王二(無代號)'])
    type(' ')
    expect(optionTexts()).toHaveLength(3)
  })

  it('以 userId 對回並以姓名比對選取狀態；選取回傳整筆、清除回傳 { id: "" }；排班半寬、送出不重新整理', async () => {
    function Controlled({ onPicked }) {
      const [value, setValue] = React.useState('u2')
      return (
        <BookingRecordListAutoComplete
          value={value}
          schedule
          onChange={u => {
            onPicked(u)
            setValue(u.userId)
          }}
        />
      )
    }
    const picked = jest.fn()
    const { settle, container } = renderPage(<Controlled onPicked={picked} />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('王二(無代號)'))
    expect(container.querySelector('form').firstChild.style.width).toBe('50%')
    openCombo()
    expect(optionByText('王二(無代號)')).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(optionByText('小三-3'))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ userId: 'u3' }))
    await wait(() => expect(combo()).toHaveValue('小三-3'))
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
    const submit = new window.Event('submit', { bubbles: true, cancelable: true })
    container.querySelector('form').dispatchEvent(submit)
    expect(submit.defaultPrevented).toBe(true)
  })

  it('頁面沒存回 value：以姓名選到時欄位顯示姓名；預設回呼不拋錯；查詢失敗不壞', async () => {
    const { settle } = renderPage(<BookingRecordListAutoComplete />, { fixtures })
    await settle()
    openCombo()
    type('李')
    fireEvent.keyDown(combo(), { key: 'a' })
    fireEvent.click(optionByText('李一-1'))
    expect(combo()).toHaveValue('李一')
    cleanup()
    const { settle: s2 } = renderPage(<BookingRecordListAutoComplete />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})
