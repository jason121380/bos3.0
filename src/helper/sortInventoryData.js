import cloneDeep from 'lodash/cloneDeep'
import compareNo from 'utils/compareNo'

const sortData = (inventoryData, type) => {
  let data = cloneDeep(inventoryData)
  if (type === 'inventory') {
    data = data.sort((a, b) => {
      return a.currentCount - b.currentCount
    })
  } else if (type === 'count') {
    const a = []
    const b = []
    data.forEach(d => {
      const { inventoryCount, currentCount } = d
      if (inventoryCount - currentCount === 0) {
        a.push(d)
      } else {
        b.push(d)
      }
      b.sort((a, b) => {
        const x = a.inventoryCount - a.currentCount
        const y = b.inventoryCount - b.currentCount
        return y - x
      })
    })
    data = [...b, ...a]
  } else {
    // 商品編號自然排序（2 在 10 前、A2 在 A10 前）、沒有編號的排最後（原本兩邊都有編號時字典序、
    // 一邊沒有時相減得 NaN 而排序失效；Jason 2026/10/22 fix all）
    data = data.sort((a, b) => compareNo(a.productNo, b.productNo))
  }
  return data
}

export default sortData
