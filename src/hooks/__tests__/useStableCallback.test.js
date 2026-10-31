// 保護 useStableCallback（效能修正 A／B）：回傳的函式身分在重畫間不變（memo 子元件才不會重畫），
// 呼叫時執行的是最新一次 render 的函式（讀到最新的 props／state），參數與回傳值原樣轉交。
import React, { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import useStableCallback from 'hooks/useStableCallback'

describe('useStableCallback', () => {
  it('身分不變、呼叫最新的函式、轉交參數與回傳值', () => {
    const seen = []
    let handlers = []
    function Probe() {
      const [count, setCount] = useState(0)
      const handler = useStableCallback((a, b) => {
        seen.push([count, a, b])
        return count * 10
      })
      handlers.push(handler)
      return (
        <button type="button" onClick={() => setCount(c => c + 1)}>
          加一
        </button>
      )
    }
    render(<Probe />)
    expect(handlers[0](1, 2)).toBe(0)
    fireEvent.click(screen.getByText('加一'))
    fireEvent.click(screen.getByText('加一'))
    expect(handlers).toHaveLength(3)
    expect(new Set(handlers).size).toBe(1)
    let result
    act(() => {
      result = handlers[0]('x', 'y')
    })
    expect(result).toBe(20)
    expect(seen).toEqual([
      [0, 1, 2],
      [2, 'x', 'y'],
    ])
  })
})
