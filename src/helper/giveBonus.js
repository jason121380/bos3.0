export default {
  ROUNDING: (totalPrice, price, bonus) => Math.round(totalPrice / price) * bonus,
  ROUNDUP: (totalPrice, price, bonus) => Math.ceil(totalPrice / price) * bonus,
  ROUNDDOWN: (totalPrice, price, bonus) => Math.floor(totalPrice / price) * bonus,
}