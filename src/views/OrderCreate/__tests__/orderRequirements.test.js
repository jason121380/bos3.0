import { getMissingForOrder } from '../orderRequirements'

// Header.js 的 `valid`（true＝缺東西、按鈕停用）。這裡逐字複製當成「規格」，確認說明文字與實際停用條件一致。
const headerValid = bill =>
  !(
    bill.date &&
    bill.designerId &&
    (bill.customerId !== undefined || bill.withoutCustomerData || bill.customerCellphone.length > 0) &&
    (bill.serviceOrders.length > 0 ||
      bill.productOrders.length > 0 ||
      bill.ticketOrders.length > 0 ||
      bill.useTicketOrders.length > 0 ||
      bill.membershipOrders.length > 0)
  )

const base = () => ({
  date: 1760000000000,
  designerId: 'd1',
  customerId: 'c1',
  withoutCustomerData: false,
  customerCellphone: '',
  serviceOrders: [{}],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
})

describe('getMissingForOrder', () => {
  // 如果說明文字說「沒缺東西」但按鈕仍停用（或反過來），使用者會不知道為什麼按不下去
  it('「有缺項」與 Header 的 valid（按鈕停用）在所有組合下一致', () => {
    const dates = [0, 1760000000000]
    const designers = ['', 'd1']
    const customers = [
      { customerId: undefined, withoutCustomerData: false, customerCellphone: '' },
      { customerId: 'c1', withoutCustomerData: false, customerCellphone: '' },
      { customerId: undefined, withoutCustomerData: true, customerCellphone: '' },
      { customerId: undefined, withoutCustomerData: false, customerCellphone: '0912345678' },
    ]
    const itemSets = ['serviceOrders', 'productOrders', 'ticketOrders', 'useTicketOrders', 'membershipOrders', null]
    dates.forEach(date =>
      designers.forEach(designerId =>
        customers.forEach(c =>
          itemSets.forEach(item => {
            const bill = { ...base(), date, designerId, ...c, serviceOrders: [] }
            if (item) bill[item] = [{}]
            expect(getMissingForOrder(bill).length > 0).toBe(headerValid(bill))
          })
        )
      )
    )
  })

  it('依序列出缺少的項目，並說明不留客資也可以', () => {
    const bill = { ...base(), designerId: '', customerId: undefined, serviceOrders: [] }
    expect(getMissingForOrder(bill)).toEqual(['服務人員', '顧客（或勾選「不留客資」）', '至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）'])
  })

  it('條件都滿足時沒有缺項', () => {
    expect(getMissingForOrder(base())).toEqual([])
  })
})
