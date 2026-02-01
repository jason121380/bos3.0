import { cloneDeep } from "lodash"

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
      if ((inventoryCount - currentCount) === 0) {
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
    data = data.sort((a, b) => {
      if (a.productNo && b.productNo) {
        return a.productNo.localeCompare(b.productNo)
      } else {
        return a.productNo - b.productNo
      }
    })
  }
  return data
}

export default sortData