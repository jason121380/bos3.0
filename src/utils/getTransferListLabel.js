export default data => {
  const { no, name, price, sellPrice } = data
  let label = ''
  if (no) {
    label += `${no} - `
  }
  label += name
  return <p>{`${label} - ${price ?? sellPrice}`}</p>
}
