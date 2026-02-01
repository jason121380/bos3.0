import { act, render } from '@testing-library/react'
import React from 'react'

import Header from '../Header'

// 測試範圍
describe('<Header />', () => {
  let wrapper = null

  // 測試案例
  it('should render Chinese title correctly', async () => {
    await act(async () => {
      wrapper = await render(<Header />)
    })
    const hasCorrectTitle = wrapper.getByText((content, element) => content === '新增收借支紀錄')
    expect(hasCorrectTitle).toBeTruthy()
  })

  it('should render English title correctly', async () => {
    await act(async () => {
      wrapper = await render(<Header />)
    })
    const hasCorrectTitle = wrapper.getByText(
      (content, element) => content === 'Create Accounting Record'
    )
    expect(hasCorrectTitle).toBeTruthy()
  })
})
