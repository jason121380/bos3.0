// 掛單結帳成功後要回到的帳單列表。
// 掛單列表的「查看掛單」會把當時的日期區間放在網址（?startDate=…&endDate=…），結帳成功後回到同一區間。
// 舊寫法用 location.search.split('=')[1].substring：查詢沒有「=」、或切出來的不是字串時會拋 TypeError。
// 結帳 mutation 已經成功，錯誤卻被同一個 .catch 當成結帳失敗，畫面跳錯誤、不跳頁（TODO P3 #8②）。
export function ordersListPath(search) {
  const raw = typeof search === 'string' ? search : ''
  let params
  try {
    params = new URLSearchParams(raw)
  } catch (e) {
    return '/management/orders'
  }
  const startDate = params.get('startDate')
  const endDate = params.get('endDate')
  if (startDate && endDate && /^\d+$/.test(startDate) && /^\d+$/.test(endDate)) {
    return `/management/orders?startDate=${startDate}&endDate=${endDate}`
  }
  return '/management/orders'
}
