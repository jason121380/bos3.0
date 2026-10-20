import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Chip, Collapse, Hidden, Rating, Tooltip } from '../misc-compat'
import { Switch } from '../switch'
import { Slider } from '../slider'

afterEach(cleanup)

describe('ui/misc-compat 與補強的 ui/switch、ui/slider', () => {
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

  // 顧客追蹤的選項膠囊：可用鍵盤 Backspace／Delete 刪除，滑鼠點刪除圖示也可
  it('Chip 可刪除時是可聚焦按鈕，Backspace 觸發 onDelete', () => {
    const onDelete = jest.fn()
    render(<Chip label="生日" onDelete={onDelete} />)
    const chip = screen.getByRole('button', { name: /生日/ })
    expect(chip).toHaveAttribute('tabindex', '0')
    fireEvent.keyUp(chip, { key: 'Backspace' })
    fireEvent.click(chip.querySelector('svg'))
    expect(onDelete).toHaveBeenCalledTimes(2)
  })

  // 顧客評分：點第 n 顆以 n 呼叫 onChange（再點同一顆為 null，同 MUI）
  it('Rating 點星以 (event, n) 呼叫，再點同一顆為 null', () => {
    const onChange = jest.fn()
    render(<Rating name="rating" value={3} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('5 Stars'))
    expect(onChange.mock.calls[0][1]).toBe(5)
    fireEvent.click(screen.getByLabelText('3 Stars'))
    expect(onChange.mock.calls[1][1]).toBeNull()
  })

  // 打卡記錄的篩選區：收合時保持掛載（篩選值不遺失）
  it('Collapse 收合時內容仍掛載', () => {
    render(
      <Collapse in={false}>
        <input aria-label="篩選" defaultValue="王小明" />
      </Collapse>
    )
    expect(screen.getByLabelText('篩選')).toHaveValue('王小明')
  })

  it('Hidden smDown 在寬度小於 600 時不渲染', () => {
    const original = window.matchMedia
    window.matchMedia = query => ({ matches: query.includes('max-width: 599.95px'), addEventListener() {}, removeEventListener() {} })
    render(
      <Hidden smDown>
        <span>已選取 3 筆</span>
      </Hidden>
    )
    expect(screen.queryByText('已選取 3 筆')).toBeNull()
    window.matchMedia = original
  })

  // 參與店家的日期提示：滑入後才出現，且以 aria-describedby 關聯
  it('Tooltip 滑入後顯示並關聯 aria-describedby', () => {
    jest.useFakeTimers()
    render(
      <Tooltip arrow title={<p>參與日期: 2026/10/20</p>}>
        <span>店家</span>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('店家'))
    act(() => jest.advanceTimersByTime(150))
    const tip = screen.getByRole('tooltip')
    expect(tip).toHaveTextContent('參與日期: 2026/10/20')
    expect(screen.getByText('店家')).toHaveAttribute('aria-describedby', tip.id)
    jest.useRealTimers()
  })
})
