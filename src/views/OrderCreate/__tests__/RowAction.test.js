import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'

import { RowIconButton } from '../RowAction'

afterEach(cleanup)

// 打帳單圖示鈕實測 32×32。排版槽維持 32px（列對齊不位移），可點的按鈕本體是 40×40。
describe('RowIconButton 觸控範圍', () => {
  it('按鈕本體 40×40，外層排版槽維持 32px 並保留呼叫端的位移', () => {
    render(
      <RowIconButton label="從清單選擇服務" className="mx-1.5 mt-[28px]">
        <span>icon</span>
      </RowIconButton>
    )
    const button = screen.getByRole('button', { name: '從清單選擇服務' })
    expect(button.className).toContain('h-10')
    expect(button.className).toContain('w-10')
    expect(button.parentElement.className).toContain('h-8')
    expect(button.parentElement.className).toContain('w-8')
    expect(button.parentElement.className).toContain('mx-1.5')
    expect(button.parentElement.className).toContain('mt-[28px]')
  })

  it('新增顧客沿用同一顆按鈕，呼叫端的顏色與圖示尺寸留在排版槽上', () => {
    render(
      <RowIconButton label="新增顧客" className="-my-1 ml-2 text-text-tertiary [&_svg]:size-5">
        <svg />
      </RowIconButton>
    )
    const button = screen.getByRole('button', { name: '新增顧客' })
    expect(button.className).toContain('h-10')
    expect(button.className).toContain('text-inherit')
    expect(button.parentElement.className).toContain('text-text-tertiary')
    expect(button.parentElement.className).toContain('[&_svg]:size-5')
    expect(button.parentElement.className).not.toContain('[&_svg]:size-[18px]')
  })
})
