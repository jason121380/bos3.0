// 保護：帳單頁與報表篩選用的「單選」品項下拉——商品、會員卡、服務。
// 櫃台靠打代號或名稱快速找到品項：篩選規則（商品：代號或名稱包含；服務：代號完全相同優先、再列名稱包含的，且不重複）、
// 選取後回傳整筆品項給帳單頁、清除時回傳「空 id」物件（帳單頁靠 id === '' 判斷該列未選）、查詢條件（只列可販售／已上架）、
// 卡券（賣卡券）與「服務＋卡券」（扣抵明細報表）的篩選規則同服務；卡券清除回傳 { id: '' }。
// 付款方式以名稱對回、選取回傳 { fee, id, name, type }（帳單計算手續費用）。
// 「選項已載入」通知（帳單頁等它才帶入舊帳單）、getData 回傳全部選項，都是帳單金額正確的前提。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import React from 'react'

import { callsOf, renderPage } from '__tests__/testkit.test'
import MemberShipCardAutoComplete from 'components/MemberShipCardAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import ServicesAutoComplete from 'components/ServicesAutoComplete'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import ServicesIncludesTicketsAutoComplete from 'components/ServicesIncludesTicketsAutoComplete'
import TicketAutoComplete from 'components/TicketAutoComplete'
import { PAGE_CRASH_TEXT } from '__tests__/testkit.test'

afterEach(cleanup)

const combo = () => screen.getByRole('combobox')
const openCombo = () => fireEvent.click(combo())
const optionTexts = () => screen.queryAllByRole('option').map(o => o.textContent)
const type = text => fireEvent.change(combo(), { target: { value: text } })

// 與帳單頁相同的受控用法：onChange 拿到品項後把 id 存回 value
function Controlled({ Component, idKey = 'id', initial = '', onPicked = () => {}, ...props }) {
  const [value, setValue] = React.useState(initial)
  return (
    <>
      <Component
        {...props}
        value={value}
        onChange={item => {
          onPicked(item)
          setValue(item && typeof item === 'object' ? item[idKey] : item)
        }}
      />
      <button type="button" onClick={() => setValue('')}>
        外部清空
      </button>
      <button type="button" onClick={() => setValue([])}>
        外部清空陣列
      </button>
    </>
  )
}

describe('ProductAutoComplete 商品', () => {
  const products = [
    { id: 'p2', no: 'B02', name: '護髮油', sellPrice: 500 },
    { id: 'p1', no: 'A01', name: '洗髮精', sellPrice: 300 },
    { id: 'p3', no: null, name: '沒有代號', sellPrice: 100 },
  ]
  const fixtures = { GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: products } } }

  it('只查可販售商品；isPublished 時另要求已上架；載入完成通知 setProductAlready、getData 拿到全部選項', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const { settle, calls } = renderPage(<ProductAutoComplete setProductAlready={ready} getData={getData} />, { fixtures })
    await settle()
    expect(callsOf(calls, 'GET_PRODUCT_IN_AUTO_COMPLETE')[0].variables).toEqual({ input: { isAvailableForSale: true } })
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledWith(products.map(p => expect.objectContaining({ id: p.id })))
    cleanup()
    const { settle: settle2, calls: calls2 } = renderPage(<ProductAutoComplete isPublished />, { fixtures })
    await settle2()
    expect(callsOf(calls2, 'GET_PRODUCT_IN_AUTO_COMPLETE')[0].variables).toEqual({ input: { isAvailableForSale: true, isPublished: true } })
  })

  it('選項顯示「代號 - 名稱 - 售價」；沒有代號的商品不列出；可用代號或名稱（不分大小寫）篩選', async () => {
    const { settle } = renderPage(<ProductAutoComplete inputProps={{ 'data-testid': 'product' }} />, { fixtures })
    await settle()
    openCombo()
    // 已知缺口（待 Jason 決定）：排序 a.no - b.no 對英數代號無效（NaN），維持後端順序
    expect(optionTexts()).toEqual(['B02 - 護髮油 - 500', 'A01 - 洗髮精 - 300'])
    expect(screen.getByTestId('product-洗髮精')).toBeInTheDocument()
    type('a01')
    expect(optionTexts()).toEqual(['A01 - 洗髮精 - 300'])
    type('護髮')
    expect(optionTexts()).toEqual(['B02 - 護髮油 - 500'])
  })

  it('選取回傳整筆商品並顯示名稱；清除回傳 { id: "" }；外部清空後欄位為空', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled Component={ProductAutoComplete} onPicked={picked} label="商品" />, { fixtures })
    await settle()
    expect(screen.getByText('商品')).toBeInTheDocument()
    openCombo()
    type('A01')
    fireEvent.click(screen.getByRole('option', { name: 'A01 - 洗髮精 - 300' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'p1', name: '洗髮精' }))
    await wait(() => expect(combo()).toHaveValue('洗髮精'))
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
    fireEvent.click(screen.getByRole('button', { name: '外部清空' }))
    await wait(() => expect(combo()).toHaveValue(''))
  })

  it('已選商品以名稱比對：選取名稱包含輸入字的商品後顯示名稱', async () => {
    const { settle } = renderPage(<Controlled Component={ProductAutoComplete} initial="p2" />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('護髮油'))
    type('洗髮')
    fireEvent.click(screen.getByRole('option', { name: 'A01 - 洗髮精 - 300' }))
    await wait(() => expect(combo()).toHaveValue('洗髮精'))
  })

  it('已選商品沒有名稱時，欄位改顯示代號', async () => {
    const { settle } = renderPage(<Controlled Component={ProductAutoComplete} initial="p9" />, {
      fixtures: { GET_PRODUCT_IN_AUTO_COMPLETE: { products: { data: [...products, { id: 'p9', no: 'Z9', name: '', sellPrice: 1 }] } } },
    })
    await settle()
    await wait(() => expect(combo()).toHaveValue('Z9'))
  })

  it('查詢失敗：沒有選項、不壞；沒給 onChange 時選取不拋錯', async () => {
    const { settle } = renderPage(<ProductAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s2 } = renderPage(<ProductAutoComplete />, { fixtures })
    await s2()
    openCombo()
    expect(() => fireEvent.click(screen.getByRole('option', { name: 'A01 - 洗髮精 - 300' }))).not.toThrow()
  })
})

describe('MemberShipCardAutoComplete 會員卡', () => {
  const memberships = [
    { uuid: 'm1', no: 'M01', name: '金卡', sellPrice: 1000, effecitveDay: 365 },
    { uuid: 'm2', no: 'M02', name: '銀卡', sellPrice: 500, effecitveDay: 180 },
  ]
  const fixtures = { FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE: { memberships: { data: memberships } } }

  it('只查可販售會員卡；載入完成通知、getData 拿到全部選項；選項顯示「名稱 - 代號」', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const { settle, calls } = renderPage(
      <MemberShipCardAutoComplete setMembershipAlready={ready} getData={getData} inputProps={{ 'data-testid': 'ms' }} />,
      { fixtures }
    )
    await settle()
    expect(callsOf(calls, 'FETCH_MEMBERSHIPS_FOR_AUTOCOMPLETE')[0].variables).toEqual({ input: { isAvailableForSale: true } })
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledWith(memberships.map(m => expect.objectContaining({ uuid: m.uuid })))
    openCombo()
    expect(optionTexts()).toEqual(['金卡 - M01', '銀卡 - M02'])
    expect(screen.getByTestId('ms-銀卡')).toBeInTheDocument()
  })

  it('選取後欄位顯示「名稱-效期天數」，回傳整筆；以 uuid 對回；清除回傳 { uuid: "" }；外部清空', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled Component={MemberShipCardAutoComplete} idKey="uuid" onPicked={picked} label="會員卡" />, {
      fixtures,
    })
    await settle()
    openCombo()
    type('銀')
    fireEvent.click(screen.getByRole('option', { name: '銀卡 - M02' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ uuid: 'm2' }))
    await wait(() => expect(combo()).toHaveValue('銀卡-180天'))
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ uuid: '' })
    fireEvent.click(screen.getByRole('button', { name: '外部清空' }))
    await wait(() => expect(combo()).toHaveValue(''))
  })

  it('輸入代號後選到同代號的卡也能顯示；查詢失敗不壞', async () => {
    const { settle } = renderPage(<Controlled Component={MemberShipCardAutoComplete} idKey="uuid" />, { fixtures })
    await settle()
    // 先打代號（篩選比對的是「名稱-天數」，代號查不到）、離開欄位，再從選單點同代號的卡
    type('M01')
    expect(optionTexts()).toEqual([])
    fireEvent.focusOut(combo())
    openCombo()
    fireEvent.click(screen.getByRole('option', { name: '金卡 - M01' }))
    await wait(() => expect(combo()).toHaveValue('金卡-365天'))
    cleanup()
    const { settle: s2 } = renderPage(<MemberShipCardAutoComplete />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s3 } = renderPage(<MemberShipCardAutoComplete />, { fixtures })
    await s3()
    openCombo()
    expect(() => fireEvent.click(screen.getByRole('option', { name: '金卡 - M01' }))).not.toThrow()
  })
})

describe('ServicesAutoComplete 服務', () => {
  const services = [
    { id: 's3', no: '3', name: '剪髮', price: 300 },
    { id: 's1', no: '1', name: '洗髮', price: 200 },
    { id: 's2', no: '2', name: '洗剪', price: 500 },
    { id: 's4', no: '', name: '加購洗髮', price: 50 },
    { id: 's5', no: null, name: '護髮', price: 800 },
  ]
  const fixtures = { GET_SERVICES_FOR_AUTOCOMPLETE: { services: { data: services } } }

  it('帶 orderId 查詢；載入完成通知、getData 拿到全部選項；選項依代號數值排序（空代號視為 0 排最前），顯示「名稱(代號) - 價格」', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const { settle, calls } = renderPage(<ServicesAutoComplete orderId="o-1" setServiceAlready={ready} getData={getData} />, { fixtures })
    await settle()
    expect(callsOf(calls, 'GET_SERVICES_FOR_AUTOCOMPLETE')[0].variables).toEqual({ input: { orderId: 'o-1' } })
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledTimes(1)
    openCombo()
    expect(optionTexts()).toEqual(['加購洗髮 - 50', '護髮 - 800', '洗髮(1) - 200', '洗剪(2) - 500', '剪髮(3) - 300'])
  })

  it('輸入代號：代號完全相同的排最前，接著是名稱包含的，不重複；只打空白時列出全部；查無時顯示中文提示', async () => {
    const onFieldChange = jest.fn()
    const { settle } = renderPage(<ServicesAutoComplete onFieldChange={onFieldChange} />, {
      fixtures: {
        GET_SERVICES_FOR_AUTOCOMPLETE: {
          services: { data: [...services, { id: 's6', no: '洗', name: '洗頭', price: 1 }] },
        },
      },
    })
    await settle()
    openCombo()
    type('洗')
    expect(onFieldChange).toHaveBeenCalled()
    expect(optionTexts()).toEqual(['洗頭(洗) - 1', '加購洗髮 - 50', '洗髮(1) - 200', '洗剪(2) - 500'])
    type('2')
    expect(optionTexts()).toEqual(['洗剪(2) - 500'])
    type('   ')
    expect(optionTexts()).toHaveLength(6)
    type('不存在')
    expect(screen.getByText('查無符合的服務')).toBeInTheDocument()
  })

  it('選取回傳整筆服務、欄位顯示「名稱(代號)」；選好後再打該服務代號並離開欄位，欄位顯示代號；外部清成空陣列時重設', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled Component={ServicesAutoComplete} onPicked={picked} label="服務" name="service" />, {
      fixtures,
    })
    await settle()
    openCombo()
    fireEvent.click(screen.getByRole('option', { name: '洗髮(1) - 200' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ id: 's1' }))
    await wait(() => expect(combo()).toHaveValue('洗髮(1)'))
    type('1')
    fireEvent.focusOut(combo())
    expect(combo()).toHaveValue('1')
    fireEvent.click(screen.getByRole('button', { name: '外部清空陣列' }))
    await wait(() => expect(combo()).toHaveValue(''))
    fireEvent.click(screen.getByRole('button', { name: '外部清空' }))
    expect(combo()).toHaveValue('')
  })

  it('代號為空字串的服務：剛打的字與代號相同（都空）時顯示名稱', async () => {
    const { settle } = renderPage(<Controlled Component={ServicesAutoComplete} initial="s4" />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('加購洗髮'))
  })

  // 已知缺口（待 Jason 決定）：代號為 null 的服務選取後，欄位文字顯示成「護髮(null)」（getOptionLabel 只排除空字串）
  it('目前行為：代號為 null 的服務，欄位顯示「名稱(null)」', async () => {
    const { settle } = renderPage(<Controlled Component={ServicesAutoComplete} initial="s5" />, { fixtures })
    await settle()
    await wait(() => expect(combo()).toHaveValue('護髮(null)'))
  })

  it('查詢失敗不壞；沒給 onChange 時選取不拋錯', async () => {
    const { settle } = renderPage(<ServicesAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s2 } = renderPage(<ServicesAutoComplete />, { fixtures })
    await s2()
    openCombo()
    type('剪')
    expect(() => fireEvent.click(screen.getByRole('option', { name: '剪髮(3) - 300' }))).not.toThrow()
  })
})

describe('PaymentAutoComplete 付款方式（單選）', () => {
  const payWays = [
    { id: 'pw1', type: 'CASH', name: '現金', fee: 0 },
    { id: 'pw2', type: 'CARD', name: '信用卡', fee: 2.5 },
  ]
  const fixtures = { merchantPayWays: { merchantPayWays: payWays } }

  it('以名稱對回已選付款方式；選取回傳 { fee, id, name, type }；載入完成通知；ref 指到輸入框', async () => {
    const ready = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef()
    const { settle } = renderPage(
      <PaymentAutoComplete ref={ref} value="現金" onChange={onChange} setPaymentAlready={ready} label="付款方式" inputProps={{ 'data-testid': 'pay' }} />,
      { fixtures }
    )
    await settle()
    expect(ready).toHaveBeenCalledWith(true)
    expect(ref.current).toBe(combo())
    await wait(() => expect(combo()).toHaveValue('現金'))
    openCombo()
    expect(optionTexts()).toEqual(['現金', '信用卡'])
    fireEvent.click(screen.getByTestId('pay-信用卡'))
    expect(onChange).toHaveBeenLastCalledWith({ fee: 2.5, id: 'pw2', name: '信用卡', type: 'CARD' })
  })

  it('沒給 data-testid 前綴、沒給 onChange 時照常運作；查詢失敗不壞', async () => {
    const { settle } = renderPage(<PaymentAutoComplete />, { fixtures })
    await settle()
    openCombo()
    expect(screen.getByTestId('-現金')).toBeInTheDocument()
    expect(() => fireEvent.click(screen.getByTestId('-現金'))).not.toThrow()
    cleanup()
    const { settle: s2 } = renderPage(<PaymentAutoComplete />, { fallback: 'error' })
    await s2()
    openCombo()
    expect(optionTexts()).toEqual([])
  })
})

describe('TicketAutoComplete 卡券（單選）', () => {
  const tickets = [
    { id: 't2', no: '2', name: '護髮十次', price: 3000 },
    { id: 't1', no: '1', name: '洗髮五次', price: 1000 },
    { id: 't3', no: '', name: '體驗券', price: 0 },
  ]
  const fixtures = { GET_TICKETS: { tickets } }

  it('帶 orderId、isLaunched 查詢；載入通知、getData 拿到全部；選項依代號排序、可用代號或名稱篩選', async () => {
    const ready = jest.fn()
    const getData = jest.fn()
    const onFieldChange = jest.fn()
    const { settle, calls } = renderPage(
      <TicketAutoComplete value="" orderId="o-1" isLaunched setCouponAlready={ready} getData={getData} onFieldChange={onFieldChange} inputProps={{ 'data-testid': 'tk' }} />,
      { fixtures }
    )
    await settle()
    expect(callsOf(calls, 'GET_TICKETS')[0].variables).toEqual({ keyword: '', categoryIds: [], isLaunched: true, orderId: 'o-1' })
    expect(ready).toHaveBeenCalledWith(true)
    expect(getData).toHaveBeenCalledTimes(1)
    openCombo()
    expect(optionTexts()).toEqual(['體驗券', '洗髮五次', '護髮十次'])
    expect(screen.getByTestId('tk-體驗券')).toBeInTheDocument()
    type('2')
    expect(onFieldChange).toHaveBeenCalled()
    expect(optionTexts()).toEqual(['護髮十次'])
    type('次')
    expect(optionTexts()).toEqual(['洗髮五次', '護髮十次'])
    type(' ')
    expect(optionTexts()).toHaveLength(3)
  })

  it('選取回傳整筆、欄位顯示「名稱(代號)」；打代號後離開欄位顯示代號；清除回傳 { id: "" }', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled Component={TicketAutoComplete} onPicked={picked} label="卡券" />, { fixtures })
    await settle()
    openCombo()
    fireEvent.click(screen.getByRole('option', { name: '洗髮五次' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ id: 't1' }))
    await wait(() => expect(combo()).toHaveValue('洗髮五次(1)'))
    type('1')
    fireEvent.focusOut(combo())
    expect(combo()).toHaveValue('1')
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith({ id: '' })
  })

  it('代號空白的卡券顯示名稱；不可編輯賣卡券時停用；沒給 orderId／isLaunched 時不帶條件', async () => {
    const { settle, calls } = renderPage(<TicketAutoComplete value="t3" isTicketSellingEditable={false} />, { fixtures })
    await settle()
    expect(callsOf(calls, 'GET_TICKETS')[0].variables).toEqual({ keyword: '', categoryIds: [] })
    await wait(() => expect(combo()).toHaveValue('體驗券'))
    expect(combo()).toBeDisabled()
    cleanup()
    renderPage(<TicketAutoComplete value="" isTicketSellingEditable />, { fixtures })
    expect(combo()).not.toBeDisabled()
  })

  it('查詢失敗不壞；沒給 onChange 時選取不拋錯', async () => {
    const { settle } = renderPage(<TicketAutoComplete value="" />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s2 } = renderPage(<TicketAutoComplete value="" />, { fixtures })
    await s2()
    openCombo()
    expect(() => fireEvent.click(screen.getByRole('option', { name: '體驗券' }))).not.toThrow()
  })

  // 已知缺口（待 Jason 決定）：value 沒給時直接讀 value.length 而拋錯（目前五個呼叫端都有傳）
  it('目前行為：沒給 value 時拋錯', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const { findByText } = renderPage(<TicketAutoComplete />, { fixtures })
    expect(await findByText(PAGE_CRASH_TEXT)).toBeInTheDocument()
    console.error.mockRestore()
  })
})

describe('ServicesIncludesTicketsAutoComplete 服務＋卡券', () => {
  const list = [
    { id: 's2', no: '2', name: '剪髮', price: 300 },
    { id: 's1', no: '1', name: '洗髮', price: 200 },
    { id: 't9', no: '', name: '洗髮卡', price: 1000 },
  ]
  const fixtures = { GET_SERVICES_AND_TICKETS: { getServiecAndTicketList: list } }

  it('列出服務與卡券「名稱 - 價格」依代號排序；代號完全相同優先、名稱包含次之、不重複；載入通知', async () => {
    const ready = jest.fn()
    const { settle } = renderPage(<ServicesIncludesTicketsAutoComplete setServiceAlready={ready} />, {
      fixtures: { GET_SERVICES_AND_TICKETS: { getServiecAndTicketList: [...list, { id: 'x', no: '洗', name: '洗頭', price: 1 }] } },
    })
    await settle()
    expect(ready).toHaveBeenCalledWith(true)
    openCombo()
    expect(optionTexts()).toEqual(['洗髮卡 - 1000', '洗髮 - 200', '剪髮 - 300', '洗頭 - 1'])
    type('洗')
    expect(optionTexts()).toEqual(['洗頭 - 1', '洗髮卡 - 1000', '洗髮 - 200'])
    type('  ')
    expect(optionTexts()).toHaveLength(4)
  })

  it('選取回傳整筆；打代號後離開欄位顯示代號；清除回傳 null；外部清成空陣列時重設；代號空白顯示名稱', async () => {
    const picked = jest.fn()
    const { settle } = renderPage(<Controlled Component={ServicesIncludesTicketsAutoComplete} onPicked={picked} label="項目" name="item" />, {
      fixtures,
    })
    await settle()
    openCombo()
    fireEvent.click(screen.getByRole('option', { name: '洗髮 - 200' }))
    expect(picked).toHaveBeenLastCalledWith(expect.objectContaining({ id: 's1' }))
    await wait(() => expect(combo()).toHaveValue('洗髮(1)'))
    type('1')
    fireEvent.focusOut(combo())
    expect(combo()).toHaveValue('1')
    fireEvent.focusIn(combo())
    fireEvent.mouseDown(screen.getByRole('button', { name: '清除' }))
    expect(picked).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByRole('button', { name: '外部清空陣列' }))
    cleanup()
    const { settle: s2 } = renderPage(<Controlled Component={ServicesIncludesTicketsAutoComplete} initial="t9" />, { fixtures })
    await s2()
    await wait(() => expect(combo()).toHaveValue('洗髮卡'))
  })

  it('查詢失敗不壞；沒給 onChange 時選取不拋錯', async () => {
    const { settle } = renderPage(<ServicesIncludesTicketsAutoComplete />, { fallback: 'error' })
    await settle()
    openCombo()
    expect(optionTexts()).toEqual([])
    cleanup()
    const { settle: s2 } = renderPage(<ServicesIncludesTicketsAutoComplete />, { fixtures })
    await s2()
    openCombo()
    expect(() => fireEvent.click(screen.getByRole('option', { name: '剪髮 - 300' }))).not.toThrow()
  })
})
