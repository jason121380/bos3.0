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

  // 店家設定尚未載入（undefined）或是未知值時不顯示名稱（與合併前沒有 default 時相同），列印範本以空白呈現
  it('設定尚未載入或未知值：不回傳名稱', () => {
    expect(designerName(designer, undefined)).toBeUndefined()
    expect(designerName(designer, 'OTHER')).toBeUndefined()
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

  // 部分商品沒有編號（舊資料）時不可拋錯；兩者都沒有編號時維持原本順序
  it('預設：沒有商品編號的商品不拋錯、維持原順序', () => {
    const noNo = [
      { productNo: '', name: '甲' },
      { productNo: null, name: '乙' },
    ]
    expect(sortData(noNo).map(d => d.name)).toEqual(['甲', '乙'])
  })

  // 已修正（Jason 2026/10/22 fix all）：原本兩邊都有編號時以 localeCompare 字典序（10 在 2 前、A10 在 A2 前），
  // 一邊沒有編號時相減得 NaN、排序失效；改用 utils/compareNo：自然排序、沒有編號的排最後
  it('預設：編號自然排序（2 在 10 前、A2 在 A10 前），沒有編號的排最後', () => {
    const mixed = ['', 'A10', '10', null, 'A2', '2'].map((productNo, i) => ({ productNo, name: `品${i}` }))
    expect(sortData(mixed).map(d => d.productNo)).toEqual(['2', '10', 'A2', 'A10', '', null])
  })

  it('不修改傳入的原陣列', () => {
    sortData(items, 'inventory')
    expect(items[0].productNo).toBe('B02')
  })
})
