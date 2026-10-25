// 商品清單查詢失敗時，「重新查詢」必須連 getAllProducts 一起重抓。
// 只重跑進銷貨報表會讓 getAllProducts.error 留著，頁面一直停在失敗畫面。
import { cleanup, fireEvent, screen, wait } from '@testing-library/react'
import ProductInvoicingRecordReport from '../index'
import { callsOf, loginAs, renderPage } from '../../../__tests__/testkit.test'

jest.setTimeout(20000)

afterEach(cleanup)

it('商品清單失敗時，重新查詢會重抓商品並離開失敗畫面', async () => {
  loginAs()
  let productsReady = false
  const page = renderPage(<ProductInvoicingRecordReport />, {
    fixtures: {
      GET_PRODUCT_IN_AUTO_COMPLETE: () => {
        if (!productsReady) return new Error('商品清單暫時無法取得')
        return {
          products: {
            data: [{ id: 'p1', no: 'A', name: '洗髮精', isUsing: true, sellPrice: 100, isLocked: 'FALSE' }],
          },
        }
      },
      GET_PRODUCT_INVOICING_RECORD_REPOPT: { productInvoicingRecordReport: [] },
    },
  })
  expect(await screen.findByText('無法載入資料')).toBeInTheDocument()
  const before = callsOf(page.calls, 'GET_PRODUCT_IN_AUTO_COMPLETE').length
  expect(before).toBeGreaterThan(0)
  productsReady = true
  fireEvent.click(screen.getByRole('button', { name: '重新查詢' }))
  await wait(() => expect(callsOf(page.calls, 'GET_PRODUCT_IN_AUTO_COMPLETE').length).toBeGreaterThan(before))
  await wait(() => expect(screen.queryByText('無法載入資料')).toBeNull())
  expect(screen.getByText('合計')).toBeInTheDocument()
  expect(callsOf(page.calls, 'GET_PRODUCT_INVOICING_RECORD_REPOPT').length).toBeGreaterThan(0)
})
