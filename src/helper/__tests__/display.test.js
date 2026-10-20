import designerName from '../designerNameType'
import getQueryStringValue from '../getQueryString'
import sortData from '../sortInventoryData'

describe('designerName：發票／明細上的設計師名稱依店家設定顯示', () => {
  const designer = { name: '王小明', nickName: 'Ming' }

  it('NAME：只顯示本名', () => {
    expect(designerName(designer, 'NAME')).toBe('王小明')
  })

  it('NICKNAME：顯示暱稱，沒有暱稱時退回本名', () => {
    expect(designerName(designer, 'NICKNAME')).toBe('Ming')
    expect(designerName({ name: '王小明', nickName: '' }, 'NICKNAME')).toBe('王小明')
  })

  it('BOTH：本名（暱稱），沒有暱稱時只顯示本名', () => {
    expect(designerName(designer, 'BOTH')).toBe('王小明(Ming)')
    expect(designerName({ name: '王小明' }, 'BOTH')).toBe('王小明')
  })

  it('沒有設計師時回傳空字串，不讓明細出現 undefined', () => {
    expect(designerName(null, 'NAME')).toBe('')
  })
})

describe('getQueryStringValue：讀網址參數（LINE 登入的 liffId、storeId 等）', () => {
  it('取得指定參數並解碼', () => {
    expect(getQueryStringValue({ key: 'storeId', location: { search: '?liffId=abc&storeId=%E4%B8%AD%E5%B1%B1' } })).toBe('中山')
  })

  it('不分大小寫', () => {
    expect(getQueryStringValue({ key: 'liffid', location: { search: '?liffId=abc' } })).toBe('abc')
  })

  it('沒有該參數時回傳空字串（呼叫端以 length 判斷）', () => {
    expect(getQueryStringValue({ key: 'liffId', location: { search: '?storeId=1' } })).toBe('')
  })
})

describe('sortInventoryData：盤點排序', () => {
  const items = [
    { productNo: 'B02', currentCount: 5, inventoryCount: 5 },
    { productNo: 'A01', currentCount: 1, inventoryCount: 4 },
    { productNo: 'C03', currentCount: 9, inventoryCount: 2 },
  ]

  it('inventory：依目前庫存由少到多', () => {
    expect(sortData(items, 'inventory').map(d => d.productNo)).toEqual(['A01', 'B02', 'C03'])
  })

  it('count：有盤差的排前面（盤差＝盤點數−目前庫存，由大到小），盤點相符的排最後', () => {
    expect(sortData(items, 'count').map(d => d.productNo)).toEqual(['A01', 'C03', 'B02'])
  })

  it('預設：依商品編號排序', () => {
    expect(sortData(items).map(d => d.productNo)).toEqual(['A01', 'B02', 'C03'])
  })

  it('不修改傳入的原陣列', () => {
    sortData(items, 'inventory')
    expect(items[0].productNo).toBe('B02')
  })
})
