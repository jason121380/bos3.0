// 保護 LINE 打卡頁（/line/map/:liffId?storeId=…）。守住：
// - 以網址的 LIFF id 取 LINE 個人資料、以裝置定位設定地圖中心（無定位時用預設座標）；「取得位置」重新定位
// - 「確認打卡」POST 打卡端點：storeId、LINE userId、目前座標；成功後傳打卡訊息回 LINE 並關閉視窗
// - 打卡失敗（非 2xx 或網路錯誤）提示並恢復按鈕；尚未登入 LINE（NOT_LOGIN，正在導向登入）不提示、其他錯誤提示
// - 取不到 LINE 個人資料時按「確認打卡」只提示、不送出（原本讀 null 拋錯並卡在「努力提交中」）
// LIFF（helper/liffHelper）、Google 地圖與 fetch 都以假物件代替，不連任何後端。
import React from 'react'
import { cleanup, fireEvent, render, screen, wait } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LiffHelper from 'helper/liffHelper'
import LineMap from '../map'

jest.mock('helper/liffHelper', () => ({
  __esModule: true,
  default: { getProfile: jest.fn(), sendMessages: jest.fn(), closeWindow: jest.fn() },
}))
jest.mock('google-map-react', () => ({
  __esModule: true,
  default: ({ center, children }) => (
    <div data-testid="map" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
}))

const ENDPOINT = 'https://apibeautyos.mlgroup.vip/api/attendance/record'
let alertSpy
let originalGeo
beforeEach(() => {
  LiffHelper.getProfile.mockResolvedValue({ userId: 'U-line-1', displayName: '小明' })
  window.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }))
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
  originalGeo = navigator.geolocation
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: jest.fn(ok => ok({ coords: { latitude: 25.05, longitude: 121.52 } })) },
  })
})
afterEach(() => {
  cleanup()
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: originalGeo })
})

const setup = (search = '?storeId=store-9') =>
  render(
    <MemoryRouter initialEntries={[`/line/map/liff-abc${search}`]}>
      <LineMap match={{ params: { id: 'liff-abc' } }} location={{ search }} />
    </MemoryRouter>
  )
const center = () => JSON.parse(screen.getByTestId('map').getAttribute('data-center'))

it('以 LIFF id 取個人資料、以定位設定地圖中心；按確認打卡送出店家、userId 與座標，成功後傳訊息回 LINE 並關閉', async () => {
  setup()
  expect(LiffHelper.getProfile).toHaveBeenCalledWith('liff-abc')
  expect(center()).toEqual({ lat: 25.05, lng: 121.52 })
  await wait(() => expect(LiffHelper.getProfile).toHaveBeenCalled())
  await Promise.resolve()
  fireEvent.click(screen.getByText('確認打卡'))
  expect(screen.getByText('努力提交中...')).toBeInTheDocument()
  await wait(() => expect(LiffHelper.closeWindow).toHaveBeenCalled())
  const [url, init] = window.fetch.mock.calls[0]
  expect(url).toBe(ENDPOINT)
  expect(init.method).toBe('POST')
  expect(init.headers['Content-Type']).toBe('application/json')
  expect(JSON.parse(init.body)).toEqual({ storeId: 'store-9', lineAccountId: 'U-line-1', location: { lat: 25.05, lng: 121.52 } })
  expect(LiffHelper.sendMessages).toHaveBeenCalledWith({ type: 'text', text: '打卡25.05,121.52' })
  expect(alertSpy).not.toHaveBeenCalled()
})

it('「取得位置」重新定位並移動地圖中心；裝置沒有定位時用預設座標', async () => {
  setup()
  navigator.geolocation.getCurrentPosition.mockImplementation(ok => ok({ coords: { latitude: 24.1, longitude: 120.6 } }))
  fireEvent.click(screen.getByText('取得位置'))
  expect(center()).toEqual({ lat: 24.1, lng: 120.6 })
  cleanup()
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined })
  setup()
  expect(center()).toEqual({ lat: 25.1426626, lng: 121.5078801 })
  await wait(() => expect(LiffHelper.getProfile).toHaveBeenCalledTimes(2))
})

it('打卡失敗（非 2xx）：提示並恢復按鈕，不傳訊息、不關閉', async () => {
  window.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 500 }))
  setup()
  await wait(() => expect(LiffHelper.getProfile).toHaveBeenCalled())
  await Promise.resolve()
  fireEvent.click(screen.getByText('確認打卡'))
  await wait(() => expect(alertSpy).toHaveBeenCalledWith('打卡失敗，請檢查網路後再試一次'))
  expect(screen.getByText('確認打卡')).toBeInTheDocument()
  expect(LiffHelper.sendMessages).not.toHaveBeenCalled()
  expect(LiffHelper.closeWindow).not.toHaveBeenCalled()
})

it('尚未登入 LINE（正在導向登入）不提示；其他取個人資料錯誤提示重新開啟', async () => {
  LiffHelper.getProfile.mockRejectedValue('NOT_LOGIN')
  setup()
  await wait(() => expect(LiffHelper.getProfile).toHaveBeenCalled())
  await new Promise(r => setTimeout(r, 0))
  expect(alertSpy).not.toHaveBeenCalled()
  cleanup()
  LiffHelper.getProfile.mockRejectedValue(new Error('init failed'))
  setup()
  await wait(() => expect(alertSpy).toHaveBeenCalledWith('無法取得 LINE 個人資料，請重新開啟此頁'))
})

it('取不到 LINE 個人資料時按確認打卡：只提示、不送出，按鈕不會卡在「努力提交中」（原本讀 null 拋錯）', async () => {
  LiffHelper.getProfile.mockRejectedValue(new Error('init failed'))
  setup()
  await wait(() => expect(alertSpy).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByText('確認打卡'))
  expect(window.fetch).not.toHaveBeenCalled()
  expect(alertSpy).toHaveBeenLastCalledWith('無法取得 LINE 個人資料，請重新開啟此頁')
  expect(screen.getByText('確認打卡')).toBeInTheDocument()
  expect(screen.queryByText('努力提交中...')).toBeNull()
})
