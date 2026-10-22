// 保護：TransferList（左右移轉清單）每一列的文字「編號 - 名稱 - 價格」。沒有編號時不顯示開頭的「 - 」；
// 沒有 price（商品）時改用 sellPrice（卡券／會員卡的售價），價格為 0 也要照實顯示（?? 而不是 ||）。
import { render } from '@testing-library/react'
import getTransferListLabel from 'utils/getTransferListLabel'

const textOf = data => render(getTransferListLabel(data)).container.textContent

describe('getTransferListLabel', () => {
  it('有編號：編號 - 名稱 - 價格', () => {
    expect(textOf({ no: 'A01', name: '洗髮', price: 300 })).toBe('A01 - 洗髮 - 300')
  })

  it('沒有編號：名稱 - 價格', () => {
    expect(textOf({ name: '洗髮', price: 300 })).toBe('洗髮 - 300')
  })

  it('沒有 price 改用 sellPrice；price 為 0 不被 sellPrice 取代', () => {
    expect(textOf({ name: '十次卡', sellPrice: 2000 })).toBe('十次卡 - 2000')
    expect(textOf({ name: '贈品', price: 0, sellPrice: 99 })).toBe('贈品 - 0')
  })
})
