// 項目 3 第三批：真實四個收據入口、記憶體 Apollo 假回應，固定時間與假客戶；不含 HttpLink。
import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import { ApolloClient, ApolloProvider, ApolloLink, InMemoryCache, Observable } from '@apollo/client'
import billContext from 'context/keyInContext'
import OrderDetailModal from 'views/OrderCreate/OrderDetailModal'
import Footer from 'views/DraftOrderEdit/Footer'
import DraftList from 'views/DraftOrderManagementList/ResultsV2'
import OrderList from 'views/OrderManagementList/ResultsV2'
const NativeDate = Date
const now = new NativeDate('2026-01-01T08:00:00+08:00').getTime()
window.Date = class extends NativeDate {
  constructor(...args) {
    super(...(args.length ? args : [now]))
  }
  static now() {
    return now
  }
}
localStorage.clear()
localStorage.setItem('userMerchant', JSON.stringify({ id: 'fake-merchant', name: '測試門市A' }))
localStorage.setItem('user', JSON.stringify({ id: 'fake-user', name: '測試人員' }))
const params = new URLSearchParams(location.search)
const key = params.get('key') || 'order-detail'
const variant = params.get('variant') || 'main'
const layout = { main: 'A4', t78: '感熱紙(80mm)', t56: '感熱紙(57mm)' }[variant]
const noop = () => {}
const service = { id: 'service-1', no: 'S01', name: '測試剪髮', price: 800 }
const product = { id: 'product-1', no: 'P01', name: '測試洗髮精', price: 200, sellPrice: 200 }
const designer = { id: 'designer-1', name: '設計師甲', nickName: '測試甲', designerNo: 'D01' }
const customer = { id: 'customer-1', name: '測試客戶甲', cellphone: '', no: 'C01' }
const helpers = [{ userId: 'helper-1', userNo: 'H01', userName: '測試助理甲' }]
const bill = {
  date: now,
  designerId: designer.id,
  customerId: customer.id,
  customerCellphone: '',
  isDesignate: true,
  payType: [],
  walletPay: 100,
  amountByOtherPay: 0,
  bonusDeposit: 10,
  bonusUsed: 0,
  bonusDecount: 0,
  serviceOrders: [{ serviceId: service.id, price: 800, thirdPartyCouponMerchantId: null, serviceOrderHelpers: [{ helperId: 'helper-1' }] }],
  productOrders: [{ productId: product.id, sellerId: designer.id, price: 200, count: 2, thirdPartyCouponMerchantId: null }],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
}
const order = {
  id: 'order-1',
  no: 'TEST001',
  orderNo: 'TEST001',
  date: now,
  customer,
  designer,
  customerName: customer.name,
  customerNo: customer.no,
  customerCellphone: '',
  designerName: designer.name,
  designerNo: 'D01',
  service: 800,
  product: 400,
  membership: 0,
  usedTicket: 0,
  raffleCount: 0,
  otherPayName: null,
  TPTName: { service: [], product: [], membership: [], overAll: [] },
  isDesignate: true,
  isCloseAccount: false,
  status: '已完成',
  remark: '模擬資料',
  source: '',
  payType: [],
  payType2: [],
  raffleRecord: [],
  serialNumber: null,
  serviceOrders: [{ price: 800, thirdPartyPayName: null, service, helperList: [] }],
  productOrders: [{ price: 200, count: 2, thirdPartyPayName: null, product, seller: designer }],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
  staticDetail: [
    {
      designerName: designer.name,
      serviceType: '項目消費',
      itemName: service.name,
      count: 1,
      price: 800,
      helperList: [{ helperName: '測試助理甲', helperNo: 'H01', helperType: '助理' }],
    },
    { designerName: designer.name, serviceType: '店販銷售', itemName: product.name, count: 2, price: 200, helperList: [] },
  ],
  walletPay: 100,
  walletUsedForDecount: -100,
  customerLeftWallet: 400,
  bonusDeposit: 10,
  bonusUsed: 0,
  bonusDecount: 0,
  bonusDecountForReport: 0,
  customerLeftBonus: 30,
  otherPayWayForDecount: 0,
  amountByOtherPay: 0,
  businessCash: 1100,
  serviceFakeTotal: 800,
  productFakeTotal: 400,
  membershipFakeTotal: 0,
  useTicketTotal: 0,
  ticketSellIntoPerformance: 0,
  performanceIncome: 1200,
  ticketSellNotIntoPerformance: 0,
  usedTicketForDecount: 0,
  thirdPartTicketForDecount: 0,
}
const detailInfo = { logo: { isDisplay: false }, qrcode: { isDisplay: false }, message: { isDisplay: false } }
// decoration hook 仍會 fetch 圖片；只接受這份記憶體空白圖，其他 fetch 立即失敗。
const imageUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
window.fetch = async url => {
  if (url !== imageUrl) throw new Error(`未登記的 fetch：${url}`)
  return { blob: async () => new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' }) }
}
const rootFixtures = {
  customer,
  merchantDesigner: designer,
  services: { data: [service] },
  products: { data: [product] },
  tickets: [],
  memberships: { data: [] },
  ticketRecords: { data: [] },
  ticketRecordsForOrder: [],
  merchant: { thirdpartyCoupons: [] },
  getUserOrderableList: helpers,
  getDesignerNameDisplayOnInvoice: 'NAME',
  getMerchantPrintFormatSettings: layout,
  getLogoDisplayOnInvoice: { isDisplay: false, imageUrl },
  getQrcodeDisplayOnInvoice: { isDisplay: false, url: 'mock receipt', imageUrl: null },
  getMessageDisplayOnInvoice: { isDisplay: false, message: null },
  merchantPassword: { reCheckoutOrder: { isUsing: false, password: '' } },
  order,
  createOrder2: 'TEST001',
}
// Apollo 每個選取欄位都補齊；未知根查詢直接失敗，沒有網路 fallback。
function fill(selection, value) {
  if (value == null) return null
  if (Array.isArray(value)) return value.map(v => fill(selection, v))
  return Object.fromEntries(
    selection.selections
      .filter(f => f.kind === 'Field')
      .map(f => {
        const name = f.name.value
        const v = value[name]
        return [
          f.alias?.value || name,
          f.selectionSet ? fill(f.selectionSet, v === undefined ? (/^(data|.*s|.*List)$/.test(name) ? [] : {}) : v) : v === undefined ? null : v,
        ]
      })
  )
}
window.receiptState = { pending: 0, mutations: 0, closed: false, writes: [] }
window.open = () => ({
  document: { querySelector: () => null, write: html => window.receiptState.writes.push(html), close: noop },
  print: noop,
  close: noop,
})
const client = new ApolloClient({
  cache: new InMemoryCache({ addTypename: false }),
  link: new ApolloLink(
    operation =>
      new Observable(observer => {
        const definition = operation.query.definitions.find(d => d.kind === 'OperationDefinition')
        const unknown = definition.selectionSet.selections.find(f => !(f.name.value in rootFixtures))
        if (unknown) {
          observer.error(new Error(`未登記的模擬查詢：${unknown.name.value}`))
          return
        }
        window.receiptState.pending++
        const isMutation = definition.operation === 'mutation'
        if (isMutation) window.receiptState.mutations++
        const timer = setTimeout(
          () => {
            observer.next({ data: fill(definition.selectionSet, rootFixtures) })
            observer.complete()
            window.receiptState.pending--
          },
          isMutation ? 100 : 0
        )
        return () => clearTimeout(timer)
      })
  ),
})
function App() {
  const [open, setOpen] = React.useState(true)
  const value = {
    bill,
    order,
    orderId: order.id,
    orderSetting: { orderId: order.id },
    bonusSetting: { isUsing: false },
    bonusActive: true,
    customerBonus: 20,
    customerWallet: 500,
    orderDetailPaymentShouldPay: 1200,
    cashPayment: 1100,
    walletPayBalanceForDetail: 400,
    stayInCreateOrder: true,
    closureDelayed: false,
    setCheckoutBtnClick: noop,
    setReset: noop,
    setBill: noop,
    handleBillChange: noop,
  }
  const common = {
    orders: [order],
    totalCount: 1,
    pageSetting: { pageOffset: 0, pageLimit: 10 },
    refetch2: noop,
    setPageSetting: noop,
    isCustomerDataMarked: false,
    membershipDisplay: true,
    bonusDisplay: true,
    detailInfo,
    orderDetailPrintLayout: layout,
    nameDisplayOnInvoice: 'NAME',
    bonusActive: true,
    passwordEnabled: { delete: false, checkout: false },
    disabled: false,
    orderStaticDetailLoading: false,
    serialNumberUsing: false,
  }
  return (
    <billContext.Provider value={value}>
      {key === 'order-detail' && open && (
        <OrderDetailModal
          openOrderDetail={open}
          orderDetailPrintLayout={layout}
          getHelperForPrint={helpers}
          onClose={() => {
            window.receiptState.closed = true
            setOpen(false)
          }}
        />
      )}
      {key === 'draft-footer' && <Footer />}
      {key === 'draft-list' && <DraftList {...common} />}
      {key === 'order-list' && <OrderList {...common} />}
    </billContext.Provider>
  )
}
ReactDOM.render(
  <MemoryRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </MemoryRouter>,
  document.getElementById('root')
)
window.receiptReady = () =>
  window.receiptState.pending === 0 &&
  (key === 'order-detail'
    ? !!document.querySelector('#DivIdToPrint') && document.querySelector('#DivIdToPrint').textContent.includes(service.name)
    : key === 'draft-footer'
      ? document.querySelector('#printMain')?.textContent.includes(service.name)
      : !!document.querySelector('[aria-label="列印帳單"]'))
