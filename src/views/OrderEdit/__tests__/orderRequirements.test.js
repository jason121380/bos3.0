import { getMissingForCheckout, getMissingForSave, getDisabledReason } from '../orderRequirements'

// Footer.js 的 `vaild`／`updateVaild`（true＝按鈕停用）。這裡逐字複製當成「規格」，確認說明文字與實際停用條件一致。
const total = bill =>
  bill.serviceOrders.reduce((a, b) => a + b.price, 0) +
  bill.productOrders.reduce((a, b) => a + b.count * b.price, 0) +
  bill.ticketOrders.reduce((a, b) => a + b.count * b.price, 0) +
  bill.membershipOrders.reduce((a, b) => a + b.price, 0)
const anyItem = bill =>
  bill.serviceOrders.length > 0 ||
  bill.productOrders.length > 0 ||
  bill.ticketOrders.length > 0 ||
  bill.useTicketOrders.length > 0 ||
  bill.membershipOrders.length > 0
const footerVaild = (bill, orderSetting) =>
  !(
    (bill.date &&
      (bill.customerId || bill.withoutCustomerData || bill.customerCellphone) &&
      bill.designerId &&
      !orderSetting.isCloseAccount &&
      anyItem(bill)) ||
    (total(bill) === 0 && anyItem(bill))
  )
const footerUpdateVaild = (bill, orderSetting) => !(bill.date && bill.customerId && bill.designerId && !orderSetting.isCloseAccount)

const base = () => ({
  date: 1760000000000,
  designerId: 'd1',
  customerId: 'c1',
  withoutCustomerData: false,
  customerCellphone: '',
  serviceOrders: [],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
})

const combos = () => {
  const out = []
  const customers = [
    { customerId: undefined, withoutCustomerData: false, customerCellphone: '' },
    { customerId: 'c1', withoutCustomerData: false, customerCellphone: '' },
    { customerId: undefined, withoutCustomerData: true, customerCellphone: '' },
    { customerId: undefined, withoutCustomerData: false, customerCellphone: '0912345678' },
  ]
  const items = [
    null,
    ['serviceOrders', { price: 500 }],
    ['serviceOrders', { price: 0 }],
    ['productOrders', { price: 300, count: 1 }],
    ['ticketOrders', { price: 0, count: 1 }],
    ['useTicketOrders', {}],
    ['membershipOrders', { price: 1000 }],
  ]
  ;[0, 1760000000000].forEach(date =>
    ['', 'd1'].forEach(designerId =>
      customers.forEach(c =>
        items.forEach(item =>
          [false, true].forEach(isCloseAccount => {
            const bill = { ...base(), date, designerId, ...c }
            if (item) bill[item[0]] = [item[1]]
            out.push({ bill, orderSetting: { isCloseAccount } })
          })
        )
      )
    )
  )
  return out
}

describe('帳單詳細 停用原因', () => {
  // 說明文字只在按鈕真的停用時出現，且停用時一定有說明（不讓使用者猜）
  it('掛單／結帳：有說明 ⇔ open || vaild || !enable（所有組合）', () => {
    combos().forEach(({ bill, orderSetting }) =>
      [false, true].forEach(open =>
        [false, true].forEach(enable => {
          const vaild = footerVaild(bill, orderSetting)
          const reason = getDisabledReason({
            busy: open,
            invalid: vaild,
            isCloseAccount: orderSetting.isCloseAccount,
            missing: getMissingForCheckout(bill),
            loading: !enable,
          })
          expect(reason !== '').toBe(open || vaild || !enable)
        })
      )
    )
  })

  it('儲存：有說明 ⇔ open || updateVaild（所有組合）', () => {
    combos().forEach(({ bill, orderSetting }) =>
      [false, true].forEach(open => {
        const updateVaild = footerUpdateVaild(bill, orderSetting)
        const reason = getDisabledReason({
          busy: open,
          invalid: updateVaild,
          isCloseAccount: orderSetting.isCloseAccount,
          missing: getMissingForSave(bill),
        })
        expect(reason !== '').toBe(open || updateVaild)
      })
    )
  })

  it('vaild 停用時列出的缺項都是真的不成立的條件', () => {
    const bill = { ...base(), date: 0, customerId: undefined, serviceOrders: [{ price: 500 }] }
    expect(footerVaild(bill, { isCloseAccount: false })).toBe(true)
    expect(getMissingForCheckout(bill)).toEqual(['帳單日期', '顧客（或勾選「不留客資」）'])
    expect(getDisabledReason({ busy: false, invalid: true, isCloseAccount: false, missing: getMissingForCheckout(bill) })).toBe(
      '尚缺：帳單日期、顧客（或勾選「不留客資」）'
    )
  })

  it('總金額為 0 但有消費時可直接結帳（vaild 的 B 條件），不顯示缺項', () => {
    const bill = { ...base(), date: 0, designerId: '', serviceOrders: [{ price: 0 }] }
    expect(footerVaild(bill, { isCloseAccount: false })).toBe(false)
    expect(getDisabledReason({ busy: false, invalid: false, isCloseAccount: false, missing: getMissingForCheckout(bill) })).toBe('')
  })

  // 防呆：Footer 日後若多了一個停用條件、這裡還沒同步，缺項會是空的；此時不顯示只有「尚缺：」三個字的說明
  it('停用但缺項清單是空的：不顯示空白的「尚缺：」', () => {
    expect(getDisabledReason({ busy: false, invalid: true, isCloseAccount: false, missing: [] })).toBe('')
  })
})
