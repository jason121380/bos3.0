// 保護「掃碼打卡」：員工用手機掃螢幕上的 QR code 打卡。守住：
// - QR code 內容是員工端打卡網址，帶後端給的一次性 key、打卡類型（上班／下班／休息開始／休息結束）與目前店家
// - 切換打卡類型時重新產生 QR code；載入中不能切換、顯示佔位
// - 有效時間 5 分鐘倒數，倒數到 0 時向後端要新的 key；有人用這個 key 打卡（socket 推回同一個 key）時也立即換新
// QR code 產生器以假函式代替（直接把網址當圖片內容），GraphQL 由模擬 link 回應。
import React from 'react'
import { act, cleanup, fireEvent, screen, wait } from '@testing-library/react'
import { QRcodeClockInActions } from 'store/QRcodeClockIn'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import QRcodeClockIn from '..'

jest.setTimeout(20000)

jest.mock('qrcode', () => ({ toDataURL: (link, cb) => cb(null, `qr:${link}`) }))

const keys = ['key-1', 'key-2', 'key-3']
const setup = () => {
  let i = 0
  return renderPage(<QRcodeClockIn />, { fixtures: { GET_QRCODE_CHECKIN_MODE: () => ({ getQrcodeCheckinCode: keys[i++] }) } })
}
const qr = () => screen.getByRole('img', { hidden: true }).getAttribute('src')
const LINK = 'qr:https://m.meimate.com/stylist/#/clock-in'

let ticks
beforeEach(() => {
  loginAs()
  ticks = []
  const real = window.setInterval
  jest.spyOn(window, 'setInterval').mockImplementation((fn, ms) => {
    if (ms === 1000) {
      ticks.push(fn)
      return 999
    }
    return real(fn, ms)
  })
})
afterEach(() => {
  cleanup()
  window.setInterval.mockRestore()
})

it('QR code 帶後端給的 key、打卡類型與店家；切換類型時重新產生；載入中顯示佔位且不能切換', async () => {
  const utils = setup()
  expect(screen.getByLabelText('載入中')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '下班' })).toBeDisabled()
  await utils.settle()
  await wait(() => expect(qr()).toBe(`${LINK}?key=key-1&status=CLOCKIN&storeId=merchant-1`))
  expect(screen.getByText('05:00')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '休息開始' }))
  expect(qr()).toBe(`${LINK}?key=key-1&status=BREAKSTART&storeId=merchant-1`)
  expect(screen.getByRole('button', { name: '休息開始' })).toHaveAttribute('aria-pressed', 'true')
  // 再按一次已選的類型不會變成未選
  fireEvent.click(screen.getByRole('button', { name: '休息開始' }))
  expect(screen.getByRole('button', { name: '休息開始' })).toHaveAttribute('aria-pressed', 'true')
})

it('倒數到 0 時向後端要新 key，QR code 換成新 key、倒數重新從 5 分鐘開始', async () => {
  const utils = setup()
  await utils.settle()
  await wait(() => expect(qr()).toContain('key=key-1'))
  const tick = ticks[ticks.length - 1]
  act(() => {
    for (let i = 0; i < 299; i += 1) tick()
  })
  expect(screen.getByText('00:01')).toBeInTheDocument()
  expect(callsOf(utils.calls, 'GET_QRCODE_CHECKIN_MODE')).toHaveLength(1)
  act(() => tick())
  await utils.settle()
  expect(callsOf(utils.calls, 'GET_QRCODE_CHECKIN_MODE')).toHaveLength(2)
  await wait(() => expect(qr()).toContain('key=key-2'))
  expect(screen.getByText('05:00')).toBeInTheDocument()
})

it('有人用目前的 key 打卡（socket 推回同一個 key）時立即要新 key；別的 key 不理會', async () => {
  const utils = setup()
  await utils.settle()
  await wait(() => expect(qr()).toContain('key=key-1'))
  act(() => {
    utils.store.dispatch(QRcodeClockInActions.setQRcodeKey('other-key'))
  })
  await utils.settle()
  expect(callsOf(utils.calls, 'GET_QRCODE_CHECKIN_MODE')).toHaveLength(1)
  act(() => {
    utils.store.dispatch(QRcodeClockInActions.setQRcodeKey('key-1'))
  })
  await utils.settle()
  expect(callsOf(utils.calls, 'GET_QRCODE_CHECKIN_MODE')).toHaveLength(2)
  await wait(() => expect(qr()).toContain('key=key-2'))
})
