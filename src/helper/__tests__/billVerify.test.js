import { checkMembershipOrders, checkProductOrders, checkServicesOrders, handleTidyBill } from '../billVerify'

// 為什麼重要：結帳前的檢查決定「帳單能不能送出」與「送出什麼」。漏檢會送出缺欄位的帳單；
// handleTidyBill 若沒把畫面專用欄位剔除，GraphQL mutation 會因多餘欄位被後端拒絕。

const baseBill = () => ({
  customerId: 'c1',
  customerCellphone: '0912345678',
  withoutCustomerData: false,
  bonusDecount: 10,
  bonusDeposit: 5,
  bonusUsed: 3,
  raffleRecord: { id: 'r1' },
  serviceOrders: [
    {
      serviceId: 's1',
      price: 800,
      isLocked: true,
      isNoCash: false,
      isBindedThirdPartTicketLocked: false,
      thirdPartyPayName: 'X',
      serviceOrderHelpers: [{ helperId: 'h1', isCheckoutbox: true }],
    },
  ],
  productOrders: [
    { sellerId: 'u1', productId: 'p1', isLocked: true },
    { sellerId: '', productId: '', isLocked: false }, // 空白列
  ],
  ticketOrders: [{ ticketId: 't1', isLocked: true }],
  membershipOrders: [
    { sellerId: 'u1', membershipUUID: 'm1' },
    { sellerId: '', membershipUUID: '' }, // 空白列
  ],
})

describe('handleTidyBill：送出前整理帳單', () => {
  it('剔除只給畫面用的欄位（isLocked、isNoCash、isCheckoutbox…），保留業務欄位', () => {
    const tidy = handleTidyBill(baseBill())
    expect(tidy.serviceOrders[0]).toEqual({
      serviceId: 's1',
      price: 800,
      serviceOrderHelpers: [{ helperId: 'h1' }],
    })
    expect(tidy.productOrders[0]).toEqual({ sellerId: 'u1', productId: 'p1' })
    expect(tidy.ticketOrders[0]).toEqual({ ticketId: 't1' })
    expect(tidy).not.toHaveProperty('raffleRecord')
  })

  it('移除使用者沒填的空白店販列與會員卡列', () => {
    const tidy = handleTidyBill(baseBill())
    expect(tidy.productOrders).toHaveLength(1)
    expect(tidy.membershipOrders).toEqual([{ sellerId: 'u1', membershipUUID: 'm1' }])
  })

  it('已選顧客時清空手打的電話（以顧客資料為準）', () => {
    expect(handleTidyBill(baseBill()).customerCellphone).toBe('')
  })

  it('沒有選顧客（customerId 未設定）時保留手打的電話', () => {
    const { customerId, ...walkIn } = baseBill()
    expect(handleTidyBill(walkIn).customerCellphone).toBe('0912345678')
  })

  it('不建立顧客資料的帳單不可動到紅利點數', () => {
    const tidy = handleTidyBill({ ...baseBill(), withoutCustomerData: true })
    expect([tidy.bonusDecount, tidy.bonusDeposit, tidy.bonusUsed]).toEqual([0, 0, 0])
  })

  it('不修改傳入的原帳單（畫面上的 state 不受影響）', () => {
    const bill = baseBill()
    handleTidyBill(bill)
    expect(bill.serviceOrders[0].isLocked).toBe(true)
    expect(bill.productOrders).toHaveLength(2)
  })
})

describe('結帳前檢查：缺件時擋下並說明缺什麼', () => {
  it('服務列沒選服務項目', () => {
    expect(checkServicesOrders([{ serviceId: 's1' }, { serviceId: '' }])).toEqual({ verify: false, message: '請選擇服務項目' })
    expect(checkServicesOrders([{ serviceId: 's1' }])).toEqual({ verify: true })
  })

  it('店販先檢查服務人員、再檢查商品', () => {
    expect(checkProductOrders([{ sellerId: '', productId: '' }])).toEqual({ verify: false, message: '請選擇店販的服務人員' })
    expect(checkProductOrders([{ sellerId: 'u1', productId: '' }])).toEqual({ verify: false, message: '請選擇店販商品' })
    expect(checkProductOrders([{ sellerId: 'u1', productId: 'p1' }])).toEqual({ verify: true })
  })

  it('會員卡要有服務人員、卡別與有效的到期日（時間戳）', () => {
    expect(checkMembershipOrders([{ sellerId: '', membershipUUID: 'm1', expiryDate: 1 }]).message).toBe('請選擇會員卡的服務人員')
    expect(checkMembershipOrders([{ sellerId: 'u1', membershipUUID: '', expiryDate: 1 }]).message).toBe('請選擇會員卡')
    expect(checkMembershipOrders([{ sellerId: 'u1', membershipUUID: 'm1', expiryDate: 'Invalid Date' }]).message).toBe('會員卡到期日有誤')
    expect(checkMembershipOrders([{ sellerId: 'u1', membershipUUID: 'm1', expiryDate: NaN }]).message).toBe('會員卡到期日有誤')
    expect(checkMembershipOrders([{ sellerId: 'u1', membershipUUID: 'm1', expiryDate: 1767196800000 }])).toEqual({ verify: true })
  })
})
