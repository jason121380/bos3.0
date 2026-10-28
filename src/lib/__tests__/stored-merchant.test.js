import { storedMerchant, storedMerchantId, storedMerchantName } from 'lib/stored-merchant'

// 為什麼：登入狀態下 userMerchant 被清（另一分頁登出、瀏覽器清資料）時，頁面不該因 JSON.parse(null).id 整頁拋錯
describe('stored-merchant', () => {
  beforeEach(() => localStorage.clear())

  it('沒有值時回 null／空字串，不拋錯', () => {
    expect(storedMerchant()).toBeNull()
    expect(storedMerchantId()).toBeNull()
    expect(storedMerchantName()).toBe('')
  })

  it('格式壞掉時視為沒有值', () => {
    localStorage.setItem('userMerchant', '{not json')
    expect(storedMerchant()).toBeNull()
    localStorage.setItem('userMerchant', '"a string"')
    expect(storedMerchantId()).toBeNull()
  })

  it('有值時回原欄位', () => {
    localStorage.setItem('userMerchant', JSON.stringify({ id: 'm1', name: '店家' }))
    expect(storedMerchantId()).toBe('m1')
    expect(storedMerchantName()).toBe('店家')
    expect(storedMerchant()).toEqual({ id: 'm1', name: '店家' })
  })
})
