const helperDeduction = (deductionData, setHelperPoint, setHelperDeductionNums, servicePrice) => {
  let totalPoint = 0
  const helperDeductionNumsArray = []
  deductionData.forEach(data => {
    const {
      isDesignate,
      nameList,
      isSplitted,
      percent,
      designatePercent,
      nonDesignatePercent,
      point,
      designatePoint,
      nonDesignatePoint,
      designateCash,
      nonDesignateCash,
      cash,
    } = data
    switch (data.deductionWay) {
      case '固定金額':
        if (isDesignate) {
          const totalCash = Math.max(designateCash, nonDesignateCash) * nameList.length
          helperDeductionNumsArray.push(totalCash)
        } else {
          if (isSplitted) {
            helperDeductionNumsArray.push(cash)
          } else {
            const totalCash = cash * nameList.length
            helperDeductionNumsArray.push(totalCash)
          }
        }
        break
      case '業績%數':
        if (isDesignate) {
          const percent = Math.max(designatePercent, nonDesignatePercent) * nameList.length
          const deduction = parseInt((servicePrice * percent) / 100, 10)
          helperDeductionNumsArray.push(deduction)
        } else {
          if (isSplitted) {
            helperDeductionNumsArray.push(parseInt((servicePrice * percent) / 100, 10))
          } else {
            const totalPercent = percent * nameList.length
            helperDeductionNumsArray.push(parseInt((servicePrice * totalPercent) / 100, 10))
          }
        }
        break
      case '點數':
        if (isDesignate) {
          totalPoint += Math.max(designatePoint, nonDesignatePoint) * nameList.length
        } else {
          if (isSplitted) {
            totalPoint += point
          } else {
            totalPoint += point * nameList.length
          }
        }
        break
      default:
        break
    }
  })
  setHelperPoint(totalPoint)
  setHelperDeductionNums(helperDeductionNumsArray.reduce((accu, curVal) => (accu += curVal), 0))
}

export default helperDeduction
