import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Error401 from '../../Error401'
import Error404 from '../../Error404'
import Error500 from '../../Error500'

// 移除未使用的斷點訂閱後，三頁仍呈現原文案與返回首頁連結。
afterEach(cleanup)
it.each([
  [401, Error401],
  [404, Error404],
  [500, Error500],
])('Error %s 保留錯誤標題與首頁連結', (code, Component) => {
  render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>
  )
  expect(screen.getByText(new RegExp(`^${code}:`))).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
})
