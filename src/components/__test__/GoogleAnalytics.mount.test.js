// GoogleAnalytics 元件掛載時呼叫 installGtag。測試環境沒有設定 REACT_APP_GA_MEASUREMENT_ID：
// 為什麼重要：未設定時原本會請求 gtag/js?id=undefined（無效請求、污染 GA）；掛載後 <head> 不能出現任何 gtag 腳本。
import React from 'react'
import { render } from '@testing-library/react'
import GoogleAnalytics from '../GoogleAnalytics'

it('未設定 GA 量測 ID 時掛載不插入 gtag 腳本，也不渲染任何內容', () => {
  expect(process.env.REACT_APP_GA_MEASUREMENT_ID).toBeFalsy()
  const { container } = render(<GoogleAnalytics />)
  expect(container.innerHTML).toBe('')
  expect(document.head.querySelector('script[src*="googletagmanager"]')).toBeNull()
})
