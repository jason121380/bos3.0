// 保護：系統參數「打帳單」分頁——打帳單相關開關與下拉、帳單明細（Logo 上傳、QRcode 網址、文字內容）、帳單來源。
// - 勾選／下拉的修改要原樣進入 SET_PARAMETER_ORDER_CREATE_SETTING（Logo 只送是否顯示）；
// - 「帳單時間使用伺服器時間」開啟時「顯示鎖定時間選項」停用；鎖定日期中顯示提示；
// - Logo：選檔 → 裁切窗 → 上傳成功後顯示新圖並關窗，失敗時提示且可再試；取消會清空選檔；
// - 帳單來源可新增、修改、刪除，存檔送出字串陣列。
// 裁切（canvas）與壓縮在 jsdom 無法執行，以替身取代；GraphQL 由模擬 link 回應，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import CropImage from '../CropImage'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { renderParameter, save, sent, checkboxByLabel, controlByLabel, selectValue, typeText, cardOf } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
// 裁切結果：jsdom 沒有 canvas，直接回傳一個檔案
jest.mock('../CropImage', () => jest.fn())
// 壓縮：原樣回傳
jest.mock('react-image-file-resizer', () => ({
  __esModule: true,
  default: { imageFileResizer: (file, w, h, fmt, q, r, cb) => cb(file) },
}))
// 裁切區：jsdom 不會載入圖片；與 react-easy-crop 4.7.5 相同，圖檔、旋轉、縮放改變時都重新回報裁切範圍（新物件）
jest.mock('react-easy-crop', () => {
  const React = require('react')
  return function MockCropper({ onCropComplete, image, rotation, zoom }) {
    React.useEffect(() => {
      onCropComplete({ x: 0, y: 0, width: 100, height: 100 }, { x: 1, y: 2, width: 30, height: 30 })
    }, [onCropComplete, image, rotation, zoom])
    return <div data-testid="cropper">{image}</div>
  }
})

beforeEach(() => {
  loginAs()
  CropImage.mockImplementation(() => Promise.resolve(new File(['x'], 'avatar')))
})
afterEach(cleanup)

const orderInput = calls => sent(calls, 'SET_PARAMETER_ORDER_CREATE_SETTING').input

describe('打帳單相關設定', () => {
  it('勾選與下拉的修改原樣送出', async () => {
    const utils = await renderParameter()
    fireEvent.click(checkboxByLabel('顯示第三方卡券欄位'))
    fireEvent.click(checkboxByLabel('指定互助人功能'))
    fireEvent.click(checkboxByLabel('啟用顧客入金折抵消費'))
    await selectValue(controlByLabel('帳單明細列印格式'), '自動寬度')
    await selectValue(controlByLabel('列印明細設計師顯示格式'), '顯示姓名(暱稱)')
    await selectValue(controlByLabel('商品是否能更改預設價格'), '可更改')
    await selectValue(controlByLabel('指不指定依據'), '依前筆帳單')
    await selectValue(controlByLabel('服務項目第三方卡券是否鎖定'), '鎖定')
    await save(utils)
    const input = orderInput(utils.calls)
    expect(input).toMatchObject({
      isThirdPartTicketDisplay: true,
      isHelperDesignationDisplay: false,
      isCusWalletUsageForOrder: false,
      printFormat: '自動寬度',
      designerNameDisplayOnInvoice: 'BOTH',
      isProductLocked: 'FALSE',
      designationSettingForOrderCreate: 'LASTORDER',
      // 布林選項送出布林值（不是字串）
      isServiceBindedThirdPartTicketLocked: true,
    })
  })

  it('使用伺服器時間時「顯示鎖定時間選項」停用；鎖定日期中顯示解除提示', async () => {
    localStorage.setItem('lockDate', true)
    await renderParameter()
    const lockOption = checkboxByLabel('顯示鎖定時間選項')
    expect(lockOption).not.toBeDisabled()
    expect(screen.getByText('請至打帳單解除鎖定日期')).toBeInTheDocument()
    fireEvent.click(checkboxByLabel('帳單時間使用伺服器時間（只允許開出現在的時間的帳單）'))
    expect(checkboxByLabel('顯示鎖定時間選項')).toBeDisabled()
  })

  it('沒有鎖定日期時不顯示提示', async () => {
    await renderParameter()
    expect(screen.queryByText('請至打帳單解除鎖定日期')).toBeNull()
  })
})

describe('帳單明細顯示設定', () => {
  it('QRcode、文字內容與 Logo 顯示開關送出；未上傳 Logo 時顯示上傳鈕', async () => {
    const utils = await renderParameter()
    const card = cardOf('帳單明細顯示設定')
    expect(screen.getByRole('button', { name: '上傳圖片' })).toBeInTheDocument()
    fireEvent.click(checkboxByLabel('啟用', card, 0))
    fireEvent.click(checkboxByLabel('啟用', card, 1))
    fireEvent.click(checkboxByLabel('啟用', card, 2))
    // 網址空值顯示空字串
    expect(controlByLabel('店家網址')).toHaveValue('')
    await typeText(controlByLabel('店家網址'), 'www.shop.example')
    expect(controlByLabel('文字內容')).toHaveValue('謝謝光臨')
    await typeText(controlByLabel('文字內容'), '歡迎再來')
    await save(utils)
    const input = orderInput(utils.calls)
    expect(input.logoDisplayOnInvoice).toBe(false)
    expect(input.qrcodeDisplayOnInvoice).toEqual({ isDisplay: true, url: 'www.shop.example' })
    expect(input.messageDisplayOnInvoice).toEqual({ isDisplay: true, message: '歡迎再來' })
  })

  it('文字內容為空時欄位顯示空字串', async () => {
    const f = require('./parameterKit.test').baseFixtures()
    const setting = f.GET_PARAMETER_ORDER_CREATE_SETTING.getParameterOrderCreateSetting
    await renderParameter({
      fixtures: {
        GET_PARAMETER_ORDER_CREATE_SETTING: {
          getParameterOrderCreateSetting: {
            ...setting,
            messageDisplayOnInvoice: { isDisplay: false, message: null },
            qrcodeDisplayOnInvoice: { isDisplay: true, url: 'https://q.example', imageUrl: null },
            logoDisplayOnInvoice: { isDisplay: true, imageUrl: 'https://img.example/logo.png' },
          },
        },
      },
    })
    expect(controlByLabel('文字內容')).toHaveValue('')
    expect(controlByLabel('店家網址')).toHaveValue('https://q.example')
    // 已有 Logo：顯示圖片（點圖片即可換圖），不顯示上傳鈕
    expect(screen.queryByRole('button', { name: '上傳圖片' })).toBeNull()
  })

  const chooseFile = async () => {
    const input = document.getElementById('upload')
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })
    await screen.findByText('選取頭像範圍')
  }

  it('Logo：選檔 → 裁切 → 上傳成功顯示新圖並關窗；上傳鈕會觸發選檔', async () => {
    const utils = await renderParameter({
      fixtures: { SET_ORDER_DETAIL_MERCHANT_LOGO: { setOrderDetailMerchantLogo: 'https://img.example/new.png' } },
    })
    const input = document.getElementById('upload')
    const clickSpy = jest.spyOn(HTMLElement.prototype, 'click')
    fireEvent.click(screen.getByRole('button', { name: '上傳圖片' }))
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
    await chooseFile()
    // 讀檔完成後裁切區帶入圖檔（data URL）
    await wait(() => expect(screen.getByTestId('cropper').textContent).toMatch(/^data:/))
    expect(input.value).toBe('')
    // 旋轉與縮放
    const [rotate, zoom] = screen.getAllByRole('slider')
    fireEvent.change(rotate, { target: { value: '90' } })
    fireEvent.change(zoom, { target: { value: '2' } })
    expect(rotate).toHaveValue('90')
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '店家Logo上傳成功', variant: 'success' }))
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
    expect(CropImage).toHaveBeenCalledWith(expect.stringMatching(/^data:/), { x: 1, y: 2, width: 30, height: 30 }, 90)
    const uploaded = callsOf(utils.calls, 'SET_ORDER_DETAIL_MERCHANT_LOGO')
    expect(uploaded).toHaveLength(1)
    expect(uploaded[0].variables.file).toBeInstanceOf(File)
    expect(screen.queryByRole('button', { name: '上傳圖片' })).toBeNull()
  })

  it('Logo：後端回傳空值時提示上傳失敗、裁切窗保留可再試', async () => {
    await renderParameter({ fixtures: { SET_ORDER_DETAIL_MERCHANT_LOGO: { setOrderDetailMerchantLogo: null } } })
    await chooseFile()
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '店家Logo上傳失敗', variant: 'error' }))
    expect(screen.getByText('選取頭像範圍')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '確認上傳' })).not.toBeDisabled()
  })

  it('Logo：上傳 mutation 失敗時顯示錯誤並恢復按鈕', async () => {
    await renderParameter({ fixtures: { SET_ORDER_DETAIL_MERCHANT_LOGO: new Error('檔案太大') } })
    await chooseFile()
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '檔案太大', variant: 'error' }))
    expect(screen.getByRole('button', { name: '確認上傳' })).not.toBeDisabled()
  })

  it('Logo：裁切失敗時顯示錯誤並恢復按鈕', async () => {
    CropImage.mockImplementation(() => Promise.reject(new Error('圖片無法讀取')))
    await renderParameter()
    await chooseFile()
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '圖片無法讀取', variant: 'error' }))
    expect(screen.getByRole('button', { name: '確認上傳' })).not.toBeDisabled()
  })

  it('Logo：裁切結果不是檔案時不上傳', async () => {
    CropImage.mockImplementation(() => Promise.resolve('not-a-file'))
    const utils = await renderParameter()
    await chooseFile()
    const resizer = require('react-image-file-resizer').default
    const orig = resizer.imageFileResizer
    resizer.imageFileResizer = (file, w, h, fmt, q, r, cb) => cb('data:uri')
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(CropImage).toHaveBeenCalled())
    await act(async () => {})
    resizer.imageFileResizer = orig
    expect(callsOf(utils.calls, 'SET_ORDER_DETAIL_MERCHANT_LOGO')).toHaveLength(0)
  })

  it('Logo：取消會關窗並清空選檔；沒選到檔案時不讀檔', async () => {
    await renderParameter()
    const input = document.getElementById('upload')
    await act(async () => {
      fireEvent.change(input, { target: { files: [] } })
    })
    await screen.findByText('選取頭像範圍')
    expect(screen.getByTestId('cropper').textContent).toBe('')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
    // 按 Esc 關閉也走同一個流程
    await chooseFile()
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
  })
})

describe('帳單來源', () => {
  it('新增、修改、刪除後送出字串陣列', async () => {
    const utils = await renderParameter()
    const card = cardOf('帳單來源')
    const inputs = () => [...card.querySelectorAll('input')]
    expect(inputs().map(i => i.value)).toEqual(['朋友介紹', '路過'])
    await typeText(inputs()[1], '網路')
    // 最後一列的新增
    fireEvent.click(card.querySelectorAll('svg.lucide-plus')[0])
    expect(inputs()).toHaveLength(3)
    await typeText(inputs()[2], 'IG')
    // 刪第一列
    fireEvent.click(card.querySelectorAll('svg[class*="lucide-trash"]')[0])
    await save(utils)
    expect(sent(utils.calls, 'SET_CUSTOMER_REFERENCE')).toEqual({ references: ['網路', 'IG'] })
  })
})
