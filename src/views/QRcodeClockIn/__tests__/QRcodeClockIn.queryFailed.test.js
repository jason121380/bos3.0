// 掃碼打卡：打卡碼查詢失敗時不能整頁拋錯，也不能先產出一張 key 為 null 的無效 QR（2026/10/28 稽核 B-03）。
import React from 'react'
import { cleanup, screen } from '@testing-library/react'
import { renderPage, loginAs, PAGE_CRASH_TEXT } from '../../../__tests__/testkit.test'
import QRcodeClockIn from '..'

jest.setTimeout(20000)
jest.mock('qrcode', () => ({ toDataURL: (link, cb) => cb(null, `qr:${link}`) }))

beforeEach(() => loginAs())
afterEach(cleanup)

it('查詢失敗：頁面不拋錯、不產出 key=null 的 QR', async () => {
  const utils = renderPage(<QRcodeClockIn />, { fixtures: { GET_QRCODE_CHECKIN_MODE: new Error('模擬 API 失敗') } })
  await utils.settle()
  expect(screen.queryByText(PAGE_CRASH_TEXT)).toBeNull()
  const img = screen.queryByRole('img', { hidden: true })
  expect(img === null || !(img.getAttribute('src') || '').includes('key=null')).toBe(true)
})
