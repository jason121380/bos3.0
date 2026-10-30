import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Switch } from '../switch'
import { Slider } from '../slider'

afterEach(cleanup)

describe('ui/switch、ui/slider 補強', () => {
  // 商品新增：「上架」「可販售」開關以 react-hook-form 的 inputRef={register} 註冊，沒接到 ref 就不會送出開關值
  it('Switch 的 inputRef 取得 input 元素', () => {
    const register = jest.fn()
    render(<Switch name="isPublished" defaultChecked inputRef={register} />)
    expect(register).toHaveBeenCalledWith(screen.getByRole('switch'))
    expect(screen.getByRole('switch')).toBeChecked()
  })

  // 行事曆尺寸拉桿：滑過時顯示目前數值（Jason 拍板保留泡泡）；沒傳 valueLabelDisplay 的既有用法維持單純 input
  it('Slider valueLabelDisplay="auto" 滑過時顯示數值，未傳時不包外層', () => {
    const { container, rerender } = render(<Slider value={40} max={70} onChange={() => {}} />)
    expect(container.firstChild.tagName).toBe('INPUT')
    rerender(<Slider value={40} max={70} valueLabelDisplay="auto" onChange={() => {}} />)
    const bubble = screen.getByText('40')
    expect(bubble).toHaveClass('opacity-0')
    fireEvent.mouseEnter(container.firstChild)
    expect(bubble).toHaveClass('opacity-100')
  })
})
