// origin/main 的範本先於遷移產生 fixture；真實 checkout hook、假 mutation，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import billContext from 'context/keyInContext'
import OrderDetailModal from '../OrderDetailModal'
import useOrderDetailItems from '../useOrderDetailItems'

jest.mock('../useOrderDetailItems')
jest.mock('hooks/useFetchCreateOrder', () => () => ({ createOrder: mockCreateOrder }))
jest.mock('elements/snackbars', () => ({ openSnackbar: jest.fn() }))
const mockCreateOrder = jest.fn()
const bill = {
  date: new Date(2026, 0, 1, 8).getTime(),
  designerId: 'designer-1',
  customerId: 'customer-1',
  customerCellphone: '',
  payType: [],
  walletPay: 100,
  amountByOtherPay: 0,
  bonusDeposit: 10,
  bonusUsed: 0,
  bonusDecount: 0,
  serviceOrders: [{ serviceId: 'service-1', price: 800, serviceOrderHelpers: [{ helperId: 'helper-1' }] }],
  productOrders: [],
  ticketOrders: [],
  useTicketOrders: [],
  membershipOrders: [],
}
const items = {
  ready: true,
  merchantName: '測試門市A',
  sellTicketTotal: 0,
  nameDisplayOnInvoice: 'NAME',
  customer: { data: { customer: { name: '測試客戶甲' } } },
  designer: { data: { merchantDesigner: { name: '設計師甲' } } },
  detailInfo: { logo: {}, qrcode: {}, message: {} },
  orderDetail: {
    servicesDetail: [{ name: '測試剪髮', price: 800, thirdPartyCoupon: null }],
    productsDetail: [],
    sellTicketsDetail: [],
    useTicketsDetail: [],
    membershipOrders: [],
  },
}
// 來源：origin/main（遷移前實跑），完整 innerHTML 與 document.write 字串，禁止更新為新實作快照。
const expected = {
  'main': {
    'atOpen': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：0</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'atSuccess': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'html':
      '<html><body onload="window.print()" style="margin: 0mm 5mm;"><div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div></body></html>',
  },
  't78': {
    'atOpen': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：0</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'atSuccess': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'html':
      '<html><style>@page {margin: 1mm; width:78mm;}</style><body onload="window.print()" style="width:78mm"><div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div></body></html>',
  },
  't56': {
    'atOpen': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：0</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'atSuccess': [
      '<div style="text-align: center;"><div style="font-size: 10px;">測試門市A</div><div style="color: rgb(0, 153, 153);">結帳單</div></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><div><div><div style="display: flex; justify-content: space-between; margin: 0px 50px;"><div style="display: flex; flex-direction: row; gap: 10px; align-items: center;"><div>測試剪髮</div><div style="font-size: 8px;">助理:H01</div></div><div>800x1</div></div></div><div></div><div></div><div></div><div></div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div>結帳：</div><div style="display: flex; margin: 0px 15px; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div><div>增點：10</div><div>扣點：0</div><div>折抵：0</div><div>點數餘額：30</div><div>卡券金額：0</div><div style="color: rgb(238, 0, 0);">付現金額：700</div></div></div>',
      '<div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div>',
    ],
    'html':
      '<html><style>@page {margin: 1mm; width:56mm;}</style><body onload="window.print()" style="width:56mm"><div><div><span>測試門市A</span><span style="margin-left: 20px;">結帳單</span></div><div>日期：2026/01/01 08:00</div><div>帳單編號：TEST001</div><div>設計師:設計師甲</div><div>顧客：測試客戶甲</div><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><table style="width: 100%;"><thead><td style="min-width: 4ch;">名稱</td><td style="min-width: 4ch;">單價</td><td style="min-width: 4ch;">數量</td><td style="min-width: 4ch;">小計</td></thead><tbody><tr><td>測試剪髮</td><td>800</td><td>1</td><td>800</td></tr><tr><td style="font-size: 6px;">助理:H01</td></tr></tbody></table><hr class="MuiDivider-root MuiDivider-fullWidth" style="width: 100%;"><div>合計：800</div><div style="display: flex; justify-content: space-between;"><div>扣入金：100</div><div>入金餘額：400</div></div><div style="display: flex; justify-content: space-between;"><div>增點：10</div><div>扣點：0</div></div><div style="display: flex; justify-content: space-between;"><div>折抵：0</div><div>點數餘額：30</div></div><div>卡券金額：0</div><div>付現金額：700</div><div>謝謝惠顧,歡迎下次光臨!</div></div></body></html>',
  },
}
let resolveMutation, close, written, receiptsAtSuccess
function Host({ layout }) {
  const [open, setOpen] = React.useState(true)
  return (
    <MemoryRouter>
      <billContext.Provider
        value={{
          bill,
          orderDetailPaymentShouldPay: 800,
          cashPayment: 700,
          customerBonus: 20,
          bonusActive: true,
          customerWallet: 500,
          walletPayBalanceForDetail: 400,
          stayInCreateOrder: true,
          setCheckoutBtnClick: () => {},
          setReset: () => {},
        }}
      >
        <OrderDetailModal
          openOrderDetail={open}
          orderDetailPrintLayout={layout}
          onClose={() => {
            close()
            setOpen(false)
          }}
          getHelperForPrint={[{ userId: 'helper-1', userNo: 'H01' }]}
        />
      </billContext.Provider>
    </MemoryRouter>
  )
}
beforeEach(() => {
  useOrderDetailItems.mockReturnValue(items)
  close = jest.fn()
  written = []
  mockCreateOrder.mockReset().mockImplementation(
    () =>
      new Promise(resolve => {
        resolveMutation = resolve
      })
  )
  window.open = jest.fn(() => ({
    document: {
      write: html => {
        receiptsAtSuccess = [...document.querySelectorAll('div[style="display: none;"]')].map(node => node.innerHTML)
        written.push(html)
      },
      close: () => {},
    },
    print: () => {},
    close: () => {},
  }))
})
afterEach(() => {
  cleanup()
  jest.useRealTimers()
})
const receipts = () => [...document.querySelectorAll('div[style="display: none;"]')].map(node => node.innerHTML)
it.each([
  ['main', 'A4'],
  ['t78', '感熱紙(80mm)'],
  ['t56', '感熱紙(57mm)'],
])('%s：開啟與成功時 refs 可讀，F8 只送一次、列印後 500ms 關閉', async (variant, layout) => {
  render(<Host layout={layout} />)
  await screen.findByRole('button', { name: '結帳並列印' })
  const atOpen = receipts()
  expect(atOpen).toHaveLength(2)
  expect(atOpen.every(html => html.includes('測試剪髮'))).toBe(true)
  fireEvent.keyDown(document, { code: 'F8' })
  fireEvent.keyDown(document, { code: 'F8' })
  expect(mockCreateOrder).toHaveBeenCalledTimes(1)
  expect(close).not.toHaveBeenCalled()
  jest.useFakeTimers()
  await act(async () => {
    resolveMutation({ data: { createOrder2: 'TEST001' } })
    await Promise.resolve()
  })
  expect(receiptsAtSuccess).toHaveLength(2)
  expect(receiptsAtSuccess.every(html => html.includes('測試剪髮'))).toBe(true)
  expect(written).toHaveLength(1)
  expect(atOpen).toEqual(expected[variant].atOpen)
  expect(receiptsAtSuccess).toEqual(expected[variant].atSuccess)
  expect(written[0]).toBe(expected[variant].html)
  expect(close).not.toHaveBeenCalled()
  act(() => jest.advanceTimersByTime(499))
  expect(close).not.toHaveBeenCalled()
  act(() => jest.advanceTimersByTime(1))
  expect(close).toHaveBeenCalledTimes(1)
  expect(receipts()).toHaveLength(0)
  fireEvent.keyDown(document, { code: 'F8' })
  expect(mockCreateOrder).toHaveBeenCalledTimes(1)
  expect(written).toHaveLength(1)
})
it('載入未完成時 F8 不送出，資料就緒後仍可 F8', async () => {
  useOrderDetailItems.mockReturnValue({ ...items, ready: false })
  const view = render(<Host layout="A4" />)
  fireEvent.keyDown(document, { code: 'F8' })
  expect(mockCreateOrder).not.toHaveBeenCalled()
  useOrderDetailItems.mockReturnValue(items)
  view.rerender(<Host layout="A4" />)
  await wait(() => expect(screen.getByRole('button', { name: '結帳並列印' })).toBeEnabled())
  fireEvent.keyDown(document, { code: 'F8' })
  expect(mockCreateOrder).toHaveBeenCalledTimes(1)
})
it('返回關閉後即使 hook 尚掛載，F8 也不列印舊資料', async () => {
  render(<Host layout="A4" />)
  await screen.findByRole('button', { name: '結帳並列印' })
  expect(receipts()).toHaveLength(2)
  fireEvent.click(screen.getByRole('button', { name: '返回' }))
  expect(close).toHaveBeenCalledTimes(1)
  expect(receipts()).toHaveLength(0)
  fireEvent.keyDown(document, { code: 'F8' })
  expect(mockCreateOrder).not.toHaveBeenCalled()
  expect(written).toHaveLength(0)
})
it('點擊結帳並列印後，非同步成功回呼仍讀到原收據', async () => {
  render(<Host layout="A4" />)
  await screen.findByRole('button', { name: '結帳並列印' })
  expect(receipts()).toEqual(expected.main.atOpen)
  fireEvent.click(screen.getByRole('button', { name: '結帳並列印' }))
  expect(mockCreateOrder).toHaveBeenCalledTimes(1)
  await act(async () => {
    resolveMutation({ data: { createOrder2: 'TEST001' } })
    await Promise.resolve()
  })
  expect(receiptsAtSuccess).toEqual(expected.main.atSuccess)
  expect(written).toEqual([expected.main.html])
  expect(close).not.toHaveBeenCalled()
  await wait(() => expect(close).toHaveBeenCalledTimes(1))
  expect(receipts()).toHaveLength(0)
})
