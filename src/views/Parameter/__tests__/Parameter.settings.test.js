// 保護：系統參數「業績依據及抽成」「密碼」「功能設定」「顧客追蹤」分頁。
// - 虛業績依據、抽成門檻依據（指定／不指定）的選擇送出代碼；
// - 操作密碼：萬能密碼與各項密碼、啟用開關原樣送出（密碼查詢不走設定快取，見 Parameter.page.test）；
// - 功能設定：開關、紅利點數給點規則（金額與點數取絕對值、非數字當 0、換算規則）、紅利折抵比例、顧客端設計師名稱、
//   日結後鎖定的功能（多選送代碼）、營業時間；店家 Logo（裁切後上傳，成功顯示新圖、失敗提示）；
// - 顧客追蹤：六類選項的新增、修改、刪除，沒有資料時可新增第一項。
// 裁切（canvas）與壓縮在 jsdom 無法執行，以替身取代；GraphQL 由模擬 link 回應，不連後端。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait, within } from '@testing-library/react'
import { openSnackbar } from 'elements/snackbars'
import CropImage from '../CropImage'
import { loginAs, callsOf } from '../../../__tests__/testkit.test'
import { baseFixtures, renderParameter, openTab, save, sent, checkboxByLabel, controlByLabel, selectValue, typeText, cardOf } from './parameterKit.test'

jest.setTimeout(30000)

jest.mock('elements/snackbars', () => ({
  ...jest.requireActual('elements/snackbars'),
  openSnackbar: jest.fn(),
}))
jest.mock('../CropImage', () => jest.fn())
jest.mock('react-image-file-resizer', () => ({
  __esModule: true,
  default: { imageFileResizer: (file, w, h, fmt, q, r, cb) => cb(file) },
}))
// 與 react-easy-crop 4.7.5 相同：圖檔、旋轉、縮放改變時重新回報裁切範圍
jest.mock('react-easy-crop', () => {
  const React = require('react')
  return function MockCropper({ onCropComplete, image, rotation, zoom }) {
    React.useEffect(() => {
      onCropComplete({ x: 0, y: 0, width: 100, height: 100 }, { x: 3, y: 4, width: 50, height: 50 })
    }, [onCropComplete, image, rotation, zoom])
    return <div data-testid="cropper">{image}</div>
  }
})

beforeEach(() => {
  loginAs()
  CropImage.mockImplementation(() => Promise.resolve(new File(['x'], 'avatar')))
})
afterEach(cleanup)

const fnInput = utils => sent(utils.calls, 'SET_PARAMETER_ABOUT_SETTING_FUNCTION').input

describe('業績依據及抽成', () => {
  it('虛業績依據與抽成門檻依據送出代碼', async () => {
    const utils = await renderParameter()
    await openTab('業績依據及抽成')
    await selectValue(controlByLabel('虛業績依據'), '服務人員業績')
    await selectValue(controlByLabel('指定'), '指定實業績')
    await selectValue(controlByLabel('不指定'), '不指定實業績')
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_FAKE_PERFORMANCE_REFER')).toEqual({ input: 'PERFORMANCE' })
    expect(sent(utils.calls, 'SET_MERCHANT_RAKE_REFERENCE')).toEqual({ input: { designate: 'DESIGNATETRUTH', nonDesignate: 'NONDESIGNATETRUTH' } })
  })
})

describe('密碼', () => {
  it('萬能密碼、各項密碼與啟用開關原樣送出', async () => {
    const utils = await renderParameter()
    await openTab('密碼')
    expect(controlByLabel('萬能密碼')).toHaveAttribute('type', 'password')
    await typeText(controlByLabel('萬能密碼'), 'super-2')
    await typeText(controlByLabel('刪除帳單密碼'), 'del-2')
    await typeText(controlByLabel('取消預約'), 'cr-2')
    const card = cardOf('密碼設定')
    // 第 2 項（刪除帳單）啟用、第 1 項（編輯帳單）取消
    fireEvent.click(checkboxByLabel('啟用', card, 1))
    fireEvent.click(checkboxByLabel('啟用', card, 0))
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_PASSWORD').input).toEqual({
      ...baseFixtures().GET_MERCHANT_PASSWORD.merchantPassword,
      superPassword: 'super-2',
      reCheckoutOrder: { password: 're-1', isUsing: false },
      deleteOrder: { password: 'del-2', isUsing: true },
      cancelReservation: { password: 'cr-2', isUsing: false },
    })
  })
})

describe('功能設定', () => {
  it('開關、顧客端設計師名稱、日結後鎖定的功能、營業時間', async () => {
    const utils = await renderParameter()
    await openTab('功能設定')
    fireEvent.click(checkboxByLabel('啟用會員卡功能'))
    fireEvent.click(checkboxByLabel('關閉掛單功能'))
    fireEvent.click(checkboxByLabel('單日預約紀錄顯示設計師事件'))
    await selectValue(controlByLabel('顧客端顯示設計師名稱'), '優先顯示暱稱')
    // 日結後鎖定：原本「材料自購」，加選「收支」
    const card = cardOf('功能設定')
    fireEvent.click(within(card).getAllByRole('combobox').find(el => el.tagName === 'INPUT'))
    fireEvent.click(screen.getByRole('option', { name: '收支' }))
    expect(controlByLabel('起始時間')).toHaveValue('09:00')
    // 營業時間欄位在 updater 內讀 event.target.value，以 typeText 模擬瀏覽器輸入；送出時沒有秒（記錄目前行為）
    await typeText(controlByLabel('起始時間'), '08:30')
    await typeText(controlByLabel('結束時間'), '22:00')
    await save(utils)
    expect(fnInput(utils)).toMatchObject({
      isMemberShipCardActive: false,
      disablePendingOrder: true,
      isEventDisplayOnDayBookingRecord: true,
      designerNameForCustomerSide: 'NICKNAME',
      actionsBannedAfterDailyCheckout: ['PICKING', 'BALANCE'],
      openingTimeForDisplay: { openingHoursForDisplay: '08:30', closingHoursForDisplay: '22:00' },
    })
  })

  it('紅利點數給點規則與折抵比例：取絕對值、非數字當 0', async () => {
    const utils = await renderParameter()
    await openTab('功能設定')
    expect(screen.queryByLabelText('消費多少元')).toBeNull()
    fireEvent.click(checkboxByLabel('啟用紅利點數給點自動換算'))
    const price = controlByLabel('消費多少元')
    expect(price).toHaveValue(100)
    fireEvent.change(price, { target: { value: '' } })
    expect(price).toHaveValue(0)
    fireEvent.change(price, { target: { value: '-250' } })
    expect(price).toHaveValue(250)
    fireEvent.wheel(price.parentElement)
    const bonus = controlByLabel('得到一點')
    fireEvent.change(bonus, { target: { value: '' } })
    expect(bonus).toHaveValue(0)
    fireEvent.change(bonus, { target: { value: '2' } })
    fireEvent.wheel(bonus.parentElement)
    await selectValue(controlByLabel('換算規則'), '無條件捨去')
    fireEvent.click(checkboxByLabel('啟用紅利點數自動換算'))
    const rate = controlByLabel('多少點折抵一元')
    fireEvent.change(rate, { target: { value: '-0.5' } })
    expect(rate).toHaveValue(0.5)
    fireEvent.change(rate, { target: { value: 'abc' } })
    expect(rate).toHaveValue(0)
    fireEvent.change(rate, { target: { value: '1.5' } })
    fireEvent.wheel(rate.parentElement)
    await save(utils)
    expect(fnInput(utils)).toMatchObject({
      bonusRewardRule: { isUsing: true, rule: { price: 250, bonus: 2, mode: 'ROUNDDOWN' } },
      isBonusConversion: true,
      bonusConversionRate: 1.5,
    })
  })

  const chooseFile = async () => {
    const input = document.getElementById('upload')
    await act(async () => {
      fireEvent.change(input, { target: { files: [new File(['logo'], 'logo.png', { type: 'image/png' })] } })
    })
    await screen.findByText('選取頭像範圍')
  }

  it('店家 Logo：選檔 → 裁切 → 上傳成功顯示新圖並關窗', async () => {
    const utils = await renderParameter({ fixtures: { SET_MERCHANT_AVATAR: { setMerchantAvatar: 'https://img.example/avatar.png' } } })
    await openTab('功能設定')
    const clickSpy = jest.spyOn(HTMLElement.prototype, 'click')
    fireEvent.click(screen.getByRole('button', { name: '上傳圖片' }))
    expect(clickSpy).toHaveBeenCalled()
    clickSpy.mockRestore()
    await chooseFile()
    await wait(() => expect(screen.getByTestId('cropper').textContent).toMatch(/^data:/))
    const [rotate, zoom] = screen.getAllByRole('slider')
    fireEvent.change(rotate, { target: { value: '180' } })
    fireEvent.change(zoom, { target: { value: '1.5' } })
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '店家Logo上傳成功', variant: 'success' }))
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
    expect(CropImage).toHaveBeenLastCalledWith(expect.stringMatching(/^data:/), { x: 3, y: 4, width: 50, height: 50 }, 180)
    expect(callsOf(utils.calls, 'SET_MERCHANT_AVATAR')[0].variables.file).toBeInstanceOf(File)
    expect(screen.queryByRole('button', { name: '上傳圖片' })).toBeNull()
  })

  it('店家 Logo：後端回傳空值時提示上傳失敗；mutation 失敗顯示錯誤；裁切結果不是檔案時不上傳', async () => {
    const utils = await renderParameter({ fixtures: { SET_MERCHANT_AVATAR: { setMerchantAvatar: null } } })
    await openTab('功能設定')
    await chooseFile()
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '店家Logo上傳失敗', variant: 'error' }))
    expect(screen.getByRole('button', { name: '確認上傳' })).not.toBeDisabled()
    // 裁切結果不是檔案（壓縮回傳字串）
    const resizer = require('react-image-file-resizer').default
    const orig = resizer.imageFileResizer
    resizer.imageFileResizer = (file, w, h, fmt, q, r, cb) => cb('data:uri')
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(CropImage).toHaveBeenCalledTimes(2))
    await act(async () => {})
    resizer.imageFileResizer = orig
    expect(callsOf(utils.calls, 'SET_MERCHANT_AVATAR')).toHaveLength(1)
    // 壓縮結果不是檔案時按鈕維持停用（實務上壓縮一律回傳檔案），以 Esc 關窗
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
  })

  it('店家 Logo：上傳 mutation 失敗顯示錯誤；已有 Logo 時顯示圖片；沒選到檔案時不讀檔', async () => {
    await renderParameter({
      fixtures: { SET_MERCHANT_AVATAR: new Error('上傳逾時'), GET_MERCHANT_AVATAR: { getMerchantAvatar: 'https://img.example/old.png' } },
    })
    await openTab('功能設定')
    expect(screen.queryByRole('button', { name: '上傳圖片' })).toBeNull()
    await act(async () => {
      fireEvent.change(document.getElementById('upload'), { target: { files: [] } })
    })
    await screen.findByText('選取頭像範圍')
    expect(screen.getByTestId('cropper').textContent).toBe('')
    fireEvent.click(screen.getByRole('button', { name: '確認上傳' }))
    await wait(() => expect(openSnackbar).toHaveBeenCalledWith({ message: '上傳逾時', variant: 'error' }))
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await wait(() => expect(screen.queryByText('選取頭像範圍')).toBeNull())
  })
})

describe('顧客追蹤', () => {
  it('各類選項新增、修改、刪除；沒有資料的類別可新增第一項', async () => {
    const utils = await renderParameter()
    await openTab('顧客追蹤')
    const hair = cardOf('髮質屬性設定')
    expect(within(hair).getByDisplayValue('細軟')).toBeInTheDocument()
    fireEvent.click(within(hair).getByRole('button', { name: '新增一項' }))
    await typeText(within(hair).getAllByRole('textbox')[1], '粗硬')
    fireEvent.click(within(hair).getByRole('button', { name: '刪除第 1 項' }))
    const scalp = cardOf('頭皮屬性設定')
    expect(scalp).toHaveTextContent('無資料')
    fireEvent.click(within(scalp).getByRole('button', { name: '新增一項' }))
    await typeText(within(scalp).getByRole('textbox'), '油性')
    await save(utils)
    expect(sent(utils.calls, 'SET_MERCHANT_HAIR_CONDITION').input).toEqual({
      hairProperties: ['粗硬'],
      scalpProperties: ['油性'],
      permAppliance: [],
      permPotion: [],
      hairColorCategory: [],
      hairColor: [],
    })
  })
})
