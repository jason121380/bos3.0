// 保護：帳單「使用卡券」列與第三方券欄位。
// 使用卡券：只列這位顧客的卡券紀錄、同一張帳單其他列已選的卡券不再出現（避免同一張卡券扣兩次）、自己這列已選的仍保留；
//   打帳單版本以「卡券種類」分組顯示剩餘張數，選取時帶入該組第一張；編輯舊帳單時可停用。
// 第三方券：以 id 對回名稱、initFirst 時自動帶入第一個（報表篩選預設值）、載入完成通知。
import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import React from 'react'

import { callsOf, renderPage } from '__tests__/testkit.test'
import CustomerTicketRecordAutoComplete from 'components/CustomerTicketRecordAutoComplete'
import CustomerTicketRecordAutoCompleteForOrderCreate from 'components/CustomerTicketRecordAutoCompleteForOrderCreate'
import CustomerTicketRecordAutoCompleteForQueueOrder from 'components/CustomerTicketRecordAutoCompleteForQueueOrder'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import ThirdPartyAutoCompleteforQueueOrder from 'components/ThirdPartyAutoCompleteforQueueOrder'

afterEach(cleanup)

const combo = () => screen.getByRole('combobox')
const openCombo = () => fireEvent.click(combo())
const optionTexts = () => screen.queryAllByRole('option').map(o => o.textContent)
const optionByText = text => screen.getAllByRole('option').find(o => o.textContent === text)

const records = [
  { id: 'r1', name: '洗髮券', remark: '' },
  { id: 'r2', name: '護髮券', remark: '生日送' },
  { id: 'r3', name: '剪髮券', remark: '' },
]
const recordFixtures = { GetTicket: { ticketRecords: { data: records } } }

describe('CustomerTicketRecordAutoComplete 使用卡券（編輯帳單）', () => {
  it('依顧客與帳單查詢（isUseTicket 有無兩種條件）；其他列已選的卡券不列出；選取回傳整筆、清除回傳 null', async () => {
    const onChange = jest.fn()
    const { settle, calls } = renderPage(
      <CustomerTicketRecordAutoComplete
        customerId="c1"
        orderId="o1"
        isUseTicket
        value="r2"
        couponUsages={[{ customerTicketId: 'r1' }]}
        onChange={onChange}
        inputProps={{ 'data-testid': 'ct' }}
        label="卡券"
      />,
      { fixtures: recordFixtures }
    )
    await settle()
    expect(callsOf(calls, 'GetTicket')[0].variables.input).toEqual({
      keyword: '',
      pageOffset: 0,
      pageLimit: 1000,
      isUseTicket: true,
      customerId: 'c1',
      orderId: 'o1',
    })
    await wait(() => expect(combo()).toHaveValue('護髮券 生日送'))
    openCombo()
    expect(optionTexts()).toEqual(['護髮券 生日送', '剪髮券 '])
    expect(screen.getByTestId('ct-剪髮券')).toBeInTheDocument()
    fireEvent.click(optionByText('剪髮券 '))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'r3' }))
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    cleanup()
    const { settle: s2, calls: calls2 } = renderPage(<CustomerTicketRecordAutoComplete customerId="c1" />, { fixtures: recordFixtures })
    await s2()
    expect(callsOf(calls2, 'GetTicket')[0].variables.input).toEqual(expect.objectContaining({ isUseTicket: false, customerId: 'c1' }))
    openCombo()
    expect(screen.getByTestId('-洗髮券')).toBeInTheDocument()
    expect(() => fireEvent.click(optionByText('洗髮券 '))).not.toThrow()
  })

  it('編輯舊帳單不允許換卡券時停用；查詢中顯示載入圖示；查詢失敗不壞', async () => {
    const { container } = renderPage(<CustomerTicketRecordAutoComplete editOrderUseTicketDisabled />, { fixtures: recordFixtures })
    expect(combo()).toBeDisabled()
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    cleanup()
    const { settle } = renderPage(<CustomerTicketRecordAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('CustomerTicketRecordAutoCompleteForQueueOrder 使用卡券（訂單佇列）', () => {
  it('依顧客查詢；打字更新關鍵字重新查詢；其他列已選的卡券不列出；不可清除；選取回傳整筆', async () => {
    const onChange = jest.fn()
    const { settle, calls, container } = renderPage(
      <CustomerTicketRecordAutoCompleteForQueueOrder customerId="c1" value="r1" couponUsages={[{ customerTicketId: 'r2' }]} onChange={onChange} />,
      { fixtures: recordFixtures }
    )
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    await settle()
    expect(callsOf(calls, 'GetTicket')[0].variables.input).toEqual({ keyword: '', customerId: 'c1', pageOffset: 0, pageLimit: 1000 })
    await wait(() => expect(combo()).toHaveValue('洗髮券 '))
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull()
    openCombo()
    fireEvent.change(combo(), { target: { value: '剪' } })
    await settle()
    expect(callsOf(calls, 'GetTicket').map(c => c.variables.input.keyword)).toContain('剪')
    expect(optionTexts()).toEqual(['洗髮券 ', '剪髮券 '])
    fireEvent.click(optionByText('剪髮券 '))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'r3' }))
  })

  it('沒給 couponUsages／onChange 時照常運作；有備註時顯示備註；查詢失敗不壞', async () => {
    const { settle } = renderPage(<CustomerTicketRecordAutoCompleteForQueueOrder customerId="c1" />, { fixtures: recordFixtures })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual(['洗髮券 ', '護髮券 生日送', '剪髮券 '])
    expect(screen.getByTestId('-護髮券')).toBeInTheDocument()
    expect(() => fireEvent.click(optionByText('護髮券 生日送'))).not.toThrow()
    cleanup()
    const { settle: s2 } = renderPage(<CustomerTicketRecordAutoCompleteForQueueOrder />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('CustomerTicketRecordAutoCompleteForOrderCreate 使用卡券（打帳單，依種類分組）', () => {
  const lazy = groups => ({ loading: false, data: { ticketRecordsForOrderV2: groups } })
  const groups = [
    { ticketName: '洗髮券', remark: '', ticketRecordForOrder: [{ id: 'a1' }, { id: 'a2' }] },
    { ticketName: '護髮券', remark: '生日', ticketRecordForOrder: [{ id: 'b1' }] },
    { ticketName: '剪髮券', remark: '', ticketRecordForOrder: [{ id: 'c1' }] },
  ]

  it('顯示「種類 剩餘N張 備註」；其他列已用的卡券扣掉、扣完的種類不列；自己這列已選的保留並顯示為已選', async () => {
    const original = JSON.stringify(groups)
    render(
      <CustomerTicketRecordAutoCompleteForOrderCreate
        ticketRecordsForOrderLazyDataV2={lazy(groups)}
        value="b1"
        couponUsages={[{ customerTicketId: 'a1' }, { customerTicketId: 'c1' }, { customerTicketId: 'b1' }, { customerTicketId: null }]}
        inputProps={{ 'data-testid': 'cu' }}
      />
    )
    await wait(() => expect(combo()).toHaveValue('護髮券 生日'))
    openCombo()
    expect(optionTexts()).toEqual(['洗髮券 剩餘1張 ', '護髮券 剩餘1張 生日'])
    expect(screen.getByTestId('cu-洗髮券')).toBeInTheDocument()
    // 不改動呼叫端傳入的查詢結果（先 cloneDeep）
    expect(JSON.stringify(groups)).toBe(original)
  })

  it('預設標籤「卡券代號/名稱」；依種類名稱篩選（不分大小寫）；選取帶入該組第一張；清除回傳 null', async () => {
    const onChange = jest.fn()
    const ref = React.createRef()
    const none = []
    render(
      <CustomerTicketRecordAutoCompleteForOrderCreate
        ref={ref}
        couponUsages={none}
        ticketRecordsForOrderLazyDataV2={lazy([...groups, { ticketName: 'VIP Card', remark: '', ticketRecordForOrder: [{ id: 'v1' }] }])}
        onChange={onChange}
      />
    )
    expect(screen.getByText('卡券代號/名稱')).toBeInTheDocument()
    expect(ref.current).toBe(combo())
    await wait(() => expect(screen.getByRole('combobox')).toBeInTheDocument())
    openCombo()
    fireEvent.change(combo(), { target: { value: 'vip' } })
    expect(optionTexts()).toEqual(['VIP Card 剩餘1張 '])
    fireEvent.change(combo(), { target: { value: '洗' } })
    fireEvent.click(optionByText('洗髮券 剩餘2張 '))
    expect(onChange).toHaveBeenLastCalledWith({ id: 'a1' })
    cleanup()
    // 已選（value 為該組某一張）時清除：回傳 null（帳單頁以 !value 清空該列與協助人員）
    const used = [{ customerTicketId: 'a2' }]
    render(<CustomerTicketRecordAutoCompleteForOrderCreate couponUsages={used} value="a2" ticketRecordsForOrderLazyDataV2={lazy(groups)} onChange={onChange} />)
    await wait(() => expect(combo()).toHaveValue('洗髮券 '))
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  // 已知缺口（待 Jason 決定）：沒給 couponUsages 時預設 [] 每次渲染都是新陣列，資料到齊後 effect（依賴 couponUsages）每次渲染都 setState，
  // 形成無限重新渲染（測試只驗證載入中的狀態）。目前唯一呼叫端（打帳單 CouponUse）都有傳。
  it('載入中顯示載入圖示；停用時不可操作；沒給 onChange 時選取不拋錯', () => {
    const none = []
    const { container, rerender } = render(
      <CustomerTicketRecordAutoCompleteForOrderCreate ticketRecordsForOrderLazyDataV2={{ loading: true }} editOrderUseTicketDisabled label="" />
    )
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(combo()).toBeDisabled()
    rerender(<CustomerTicketRecordAutoCompleteForOrderCreate couponUsages={none} ticketRecordsForOrderLazyDataV2={lazy(groups)} />)
    openCombo()
    expect(() => fireEvent.click(optionByText('剪髮券 剩餘1張 '))).not.toThrow()
  })
})

describe('ThirdPartyAutoComplete／forQueueOrder 第三方券', () => {
  const coupons = [
    { id: 'tp1', name: '街口', fee: 1, type: 'A' },
    { id: 'tp2', name: 'LINE Pay', fee: 2, type: 'B' },
  ]
  const fixtures = { FETCH_THIRDPARTYS: { merchant: { id: 'm', thirdpartyCoupons: coupons } } }

  it.each([
    ['ThirdPartyAutoComplete', ThirdPartyAutoComplete],
    ['ThirdPartyAutoCompleteforQueueOrder', ThirdPartyAutoCompleteforQueueOrder],
  ])('%s：以 id 對回名稱；選取回傳整筆、清除回傳 null；載入完成通知', async (_name, Component) => {
    const onChange = jest.fn()
    const ready = jest.fn()
    const { settle } = renderPage(<Component value="tp2" onChange={onChange} setThirdPartyAlready={ready} label="第三方" />, { fixtures })
    await settle()
    expect(ready).toHaveBeenCalledWith(true)
    await wait(() => expect(combo()).toHaveValue('LINE Pay'))
    openCombo()
    expect(optionTexts()).toEqual(['街口', 'LINE Pay'])
    fireEvent.click(screen.getByTestId('街口'))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'tp1' }))
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it.each([
    ['ThirdPartyAutoComplete', ThirdPartyAutoComplete],
    ['ThirdPartyAutoCompleteforQueueOrder', ThirdPartyAutoCompleteforQueueOrder],
  ])('%s：initFirst 時自動帶入第一個；停用；沒給 value 時空白；查詢失敗不壞', async (_name, Component) => {
    const onChange = jest.fn()
    const { settle } = renderPage(<Component initFirst onChange={onChange} disabled />, { fixtures })
    await settle()
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'tp1' }))
    expect(combo()).toBeDisabled()
    expect(combo()).toHaveValue('')
    cleanup()
    const { settle: s2 } = renderPage(<Component />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s3 } = renderPage(<Component />, { fixtures })
    await s3()
    openCombo()
    expect(() => fireEvent.click(screen.getByTestId('街口'))).not.toThrow()
  })
})
