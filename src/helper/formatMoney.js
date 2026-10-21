const formatMoney = (amount, decimalCount = 2) => {
  try {
    const negativeSign = amount < 0 ? '-' : ''
    const i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(
        isNaN(Math.abs(decimalCount)) ? 2 : decimalCount
      ))
    , 10).toString()
    const j = i.length > 3 ? i.length % 3 : 0
    return (
      negativeSign +
      (j ? i.substr(0, j) + ', ' : '') +
      i.substr(j).replace(/(\d{3})(?=\d)/g, '$1, ')
    )
  } catch (e) {
    console.error(e)
  }
}

export default formatMoney
