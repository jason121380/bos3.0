// 保護四個帳單頁共用的紅利點數規則（OrderShared/bonusRules，2026/10/21 自四份逐字相同的 Bonus 合併）：
// 「點數折抵金額」不得超過顧客實際要付的錢——第三方卡券（已由平台收款）的項目不能拿點數折抵，
// 已用其他付款方式或扣入金付掉的部分也不能再折；「點數給點」在店家設定自動給點時不可手動改，
// 限 LINE 綁定才給點時未綁定的顧客不可給點。這些規則一錯，就會讓顧客用點數折掉不該折的金額或多拿點數。
import { getBonusWalletPayLimit, isBonusDepositDisabled } from '../bonusRules'

const bill = (o = {}) => ({
  serviceOrders: [],
  productOrders: [],
  ticketOrders: [],
  membershipOrders: [],
  amountByOtherPay: 0,
  walletPay: 0,
  ...o,
})

describe('點數折抵金額上限', () => {
  it('服務、店販（單價×數量）、會員卡、卡券銷售（單價×數量）全部計入', () => {
    expect(
      getBonusWalletPayLimit(
        bill({
          serviceOrders: [{ price: 800, thirdPartyCouponMerchantId: null }],
          productOrders: [{ price: 300, count: 2, thirdPartyCouponMerchantId: null }],
          membershipOrders: [{ price: 5000 }],
          ticketOrders: [{ price: 1000, count: 3 }],
        })
      )
    ).toBe(800 + 600 + 5000 + 3000)
  })

  it('第三方卡券（thirdPartyCouponMerchantId 為字串）的服務／店販／會員卡不計入', () => {
    expect(
      getBonusWalletPayLimit(
        bill({
          serviceOrders: [
            { price: 800, thirdPartyCouponMerchantId: null },
            { price: 2500, thirdPartyCouponMerchantId: 'gomaji' },
          ],
          productOrders: [{ price: 880, count: 1, thirdPartyCouponMerchantId: 'gomaji' }],
          membershipOrders: [{ price: 12000, thirdPartyCouponMerchantId: 'gomaji' }],
        })
      )
    ).toBe(800)
  })

  it('扣掉其他付款方式與扣入金已付的部分', () => {
    expect(
      getBonusWalletPayLimit(bill({ serviceOrders: [{ price: 1000, thirdPartyCouponMerchantId: null }], amountByOtherPay: 300, walletPay: 200 }))
    ).toBe(500)
  })

  it('沒有項目、或所有項目都是第三方卡券時上限為 0（不能折抵）', () => {
    expect(getBonusWalletPayLimit(bill())).toBe(0)
    expect(getBonusWalletPayLimit(bill({ serviceOrders: [{ price: 2500, thirdPartyCouponMerchantId: 'gomaji' }] }))).toBe(0)
  })
})

describe('點數給點是否停用', () => {
  const rule = isUsing => ({ isUsing, rule: { price: 100, bonus: 1, mode: 'ROUNDING' } })

  it('店家設定自動給點時停用（由規則計算），沒有自動給點時可手動輸入', () => {
    expect(isBonusDepositDisabled({ bonusRewardWithLINE: false, isLineBinded: false, bonusSetting: rule(true) })).toBe(true)
    expect(isBonusDepositDisabled({ bonusRewardWithLINE: false, isLineBinded: false, bonusSetting: rule(false) })).toBe(false)
  })

  it('限 LINE 綁定才給點：未綁定一律停用；已綁定時依自動給點設定', () => {
    expect(isBonusDepositDisabled({ bonusRewardWithLINE: true, isLineBinded: false, bonusSetting: rule(false) })).toBe(true)
    expect(isBonusDepositDisabled({ bonusRewardWithLINE: true, isLineBinded: true, bonusSetting: rule(false) })).toBe(false)
    expect(isBonusDepositDisabled({ bonusRewardWithLINE: true, isLineBinded: true, bonusSetting: rule(true) })).toBe(true)
  })
})
