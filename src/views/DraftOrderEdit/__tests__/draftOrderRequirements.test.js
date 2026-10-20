import { getMissingForDraftOrder } from '../draftOrderRequirements'

// Footer.js 的 `vaild`（true＝缺東西、儲存／結帳停用）。這裡逐字複製當成「規格」，確認說明文字與實際停用條件一致。
const footerVaild = bill =>
  !(
    bill.date &&
    (bill.customerId || bill.withoutCustomerData || bill.customerCellphone) &&
    bill.designerId &&
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

describe('getMissingForDraftOrder', () => {
  it('「有缺項」與 Footer 的 vaild（按鈕停用）在所有組合下一致', () => {
    const dates = [0, null, 1760000000000]
    const designers = ['', undefined, 'd1']
    // 草稿從後端載入時 customerCellphone 可能是 null、customerId 可能是 undefined
    const customers = [
      { customerId: undefined, withoutCustomerData: false, customerCellphone: '' },
      { customerId: undefined, withoutCustomerData: false, customerCellphone: null },
      { customerId: '', withoutCustomerData: false, customerCellphone: '' },
      { customerId: 'c1', withoutCustomerData: false, customerCellphone: '' },
      { customerId: 'c1', withoutCustomerData: false, customerCellphone: null },
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
            expect(getMissingForDraftOrder(bill).length > 0).toBe(footerVaild(bill))
          })
        )
      )
    )
  })

  it('依 vaild 的順序列出缺少的項目，並說明不留客資也可以', () => {
    const bill = { ...base(), date: 0, designerId: '', customerId: undefined, customerCellphone: null, serviceOrders: [] }
    expect(getMissingForDraftOrder(bill)).toEqual([
      '帳單日期',
      '顧客（或勾選「不留客資」）',
      '服務人員',
      '至少一項消費（服務、店販、預收卡、使用預收卡或會員卡）',
    ])
  })

  it('條件都滿足時沒有缺項', () => {
    expect(getMissingForDraftOrder(base())).toEqual([])
  })
})
