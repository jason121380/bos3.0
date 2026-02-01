const roundDecimal = (val, precision = 2) => {
  const digitnum = Math.pow(10, precision)
  return Math.round(val * digitnum) / digitnum
}

export default roundDecimal