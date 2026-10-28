import React from 'react'
import { render, screen } from '@testing-library/react'
import ApiEnvBanner from '../ApiEnvBanner'
import { IMPLICIT_API_NOTICE } from 'lib/api-base'

// 為什麼重要：127.0.0.1 與預覽網址以前沒設 REACT_APP_API_URL 就連正式 API。提示要讓人看得出來現在改連測試環境。

test('IP 與預覽網址顯示未連正式環境；正式站與 localhost 不顯示', () => {
  const { rerender } = render(<ApiEnvBanner envUrl={null} href="http://127.0.0.1:3000/" />)
  expect(screen.getByTestId('api-env-banner')).toHaveTextContent(IMPLICIT_API_NOTICE)
  expect(screen.getByRole('status')).toBeInTheDocument()

  rerender(<ApiEnvBanner envUrl={null} href="https://bos-preview.up.railway.app/" />)
  expect(screen.getByRole('status')).toHaveTextContent('不會連正式 API')

  rerender(<ApiEnvBanner envUrl={null} href="https://bos.lure.com.tw/" />)
  expect(screen.queryByRole('status')).toBeNull()

  rerender(<ApiEnvBanner envUrl={null} href="http://localhost:3000/" />)
  expect(screen.queryByRole('status')).toBeNull()
})

test('有設定 API 位址時不顯示提示', () => {
  render(<ApiEnvBanner envUrl="https://example.test/graphql" href="http://127.0.0.1:3000/" />)
  expect(screen.queryByTestId('api-env-banner')).toBeNull()
})
