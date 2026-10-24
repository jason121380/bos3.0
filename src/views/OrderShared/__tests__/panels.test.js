import React from 'react'
import { cleanup, fireEvent, render, screen, wait, within } from '@testing-library/react'
import { Provider as BillProvider } from 'context/keyInContext'
import PannelPayment from '../PannelPayment'
import PannelRemark from '../PannelRemark'
import Remark from '../Remark'
import useInvoiceDecorations from '../useInvoiceDecorations'
import { renderPage, networkRequests } from '../../../__tests__/testkit.test'

// 為什麼重要：
// - 帳單詳細／掛單詳細／重新開單的「其他付款方式」「備註及來源」卡片：已有付款資料或備註／來源的帳單要標成展開（open），
//   讓使用者一眼看到既有資料；沒有時標成收合（closed）。卡片內容一律掛載（查詢與副作用不受影響）
// - 備註與帳單來源寫回帳單：選「無」來源時存 null（後端以 null 表示沒有來源，存空字串會變成一個叫「」的來源）
// - 收據 QR code：店家開啟 QR code 但網址空白時不可產生壞掉的圖片，也不可讓明細彈窗拋錯
// GraphQL 由模擬 link 回應，不連後端。

// jsdom 沒有 canvas，真的 qrcode 套件一律失敗；以與套件相同的行為代替：有文字回傳 PNG data URL，空字串回傳錯誤（No input text）
jest.mock('qrcode', () => ({
  toDataURL: (text, callback) => (text ? callback(null, `data:image/png;base64,${Buffer.from(text).toString('base64')}`) : callback(new Error('No input text'))),
}))

afterEach(cleanup)

const baseBill = { payType: [], amountByOtherPay: 0, walletPay: 0, remark: '', source: null }
const renderWithBill = (ui, bill, handleBillChange = jest.fn()) =>
  render(<BillProvider value={{ bill: { ...baseBill, ...bill }, handleBillChange }}>{ui}</BillProvider>)
const Content = () => <span>卡片內容</span>
const cardState = () => screen.getByText('卡片內容').closest('[data-state]').getAttribute('data-state')

describe('其他付款方式卡片', () => {
  it.each([
    ['沒有其他付款', {}, 'closed'],
    ['有一種付款方式', { payType: [{ name: '信用卡' }] }, 'open'],
    ['有其他付款金額', { amountByOtherPay: 500 }, 'open'],
    ['有扣入金', { walletPay: 300 }, 'open'],
  ])('%s → %s', (_name, bill, state) => {
    renderWithBill(<PannelPayment Payment={Content} />, bill)
    expect(screen.getByText('其他付款方式')).toBeInTheDocument()
    expect(cardState()).toBe(state)
  })
})

describe('備註及來源卡片', () => {
  it.each([
    ['沒有備註與來源', {}, 'closed'],
    ['有備註', { remark: '下次預約 11/1' }, 'open'],
    ['有來源', { source: '網路' }, 'open'],
  ])('%s → %s', (_name, bill, state) => {
    renderWithBill(<PannelRemark Remark={Content} />, bill)
    expect(screen.getByText('備註及來源')).toBeInTheDocument()
    expect(cardState()).toBe(state)
  })
})

describe('備註與帳單來源欄位', () => {
  const renderRemark = bill => {
    const handleBillChange = jest.fn()
    const page = renderPage(
      <BillProvider value={{ bill: { ...baseBill, ...bill }, handleBillChange }}>
        <Remark />
      </BillProvider>,
      { fixtures: { GET_CUSTOMER_REFERENCE: { getCustomerReference: ['朋友介紹', '網路'] } } }
    )
    return { ...page, handleBillChange }
  }
  const sourceSelect = () => screen.getByText('帳單來源', { selector: 'label' }).parentElement.querySelector('select')

  it('輸入備註寫回帳單', async () => {
    const { handleBillChange, settle } = renderRemark()
    await settle()
    fireEvent.change(screen.getByTestId('remark'), { target: { value: '指定 Amy' } })
    expect(handleBillChange).toHaveBeenCalledWith({ key: 'remark', value: '指定 Amy' })
  })

  it('選來源寫入來源名稱；選「無」寫入 null', async () => {
    const { handleBillChange, settle } = renderRemark({ source: '網路' })
    await settle()
    const select = sourceSelect()
    fireEvent.change(select, { target: { value: within(select).getByText('朋友介紹').value } })
    expect(handleBillChange).toHaveBeenLastCalledWith({ key: 'source', value: '朋友介紹' })
    fireEvent.change(select, { target: { value: within(select).getByText('無').value } })
    expect(handleBillChange).toHaveBeenLastCalledWith({ key: 'source', value: null })
  })
})

describe('收據 QR code', () => {
  const renderDecorations = qrcode => {
    const latest = {}
    function Probe() {
      Object.assign(latest, useInvoiceDecorations())
      return null
    }
    const page = renderPage(<Probe />, {
      fixtures: {
        GET_LOGO_DISPLAY_INVOICE: { getLogoDisplayOnInvoice: { isDisplay: false, imageUrl: null } },
        GET_QRCODE_DISPLAY_ON_INVOICE: { getQrcodeDisplayOnInvoice: qrcode },
        GET_MESSAGE_DISPLAY_ON_INVOICE: { getMessageDisplayOnInvoice: { isDisplay: false, message: null } },
      },
    })
    return { ...page, latest }
  }

  it('有網址：產生 QR code 圖片', async () => {
    const { latest, settle } = renderDecorations({ isDisplay: true, url: 'https://line.me/R/ti/p/@shop', imageUrl: null })
    await settle()
    await wait(() => expect(latest.qrcodeUrl).toMatch(/^data:image\/png;base64,/))
  })

  it('沒有 logo 網址時不 fetch（避免打到 /null）', async () => {
    const before = networkRequests.length
    const { settle } = renderDecorations({ isDisplay: false, url: null, imageUrl: null })
    await settle()
    expect(networkRequests.slice(before)).not.toContain('null')
  })

  it('開啟 QR code 但網址空白：不產生圖片、不拋錯', async () => {
    const { latest, settle } = renderDecorations({ isDisplay: true, url: '', imageUrl: null })
    await settle()
    await wait(() => expect(latest.detailInfo.qrcode).toEqual(expect.objectContaining({ isDisplay: true, url: '' })))
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(latest.qrcodeUrl).toBe('')
  })
})
