import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { NativeSelect, NativeSelectOption } from '../native-select'
import TextField, { InputBase } from '../text-field'

import { Slider } from '../slider'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

// 保護什麼：表單輸入元件的「值」與「事件」契約。
// - NativeSelect 以索引對應任何型別的選項值，onChange 拿回原始值；選項文字從巢狀節點取出。
// - TextField／InputBase 的 ref 要同時交給 inputRef、InputProps.inputProps.ref、inputProps.ref（react-hook-form 註冊用）。
// - Slider 依 step 修整浮點誤差後才回呼（裁切 zoom、行事曆拉桿的存值不漂移）。
// - ToggleGroup 單選／多選與單獨使用的篩選鈕，onClick 可 preventDefault 阻止切換。

afterEach(cleanup)

describe('NativeSelect', () => {
  it('Fragment 內的選項也收得到，非元素子節點略過；選項文字取自巢狀節點', () => {
    const onChange = jest.fn()
    render(
      <NativeSelect aria-label="店家" value={2} onChange={onChange} name="store">
        {null}
        {false}
        <>
          <NativeSelectOption value={1}>
            {'A'}
            <b>店</b>
            {null}
          </NativeSelectOption>
          <NativeSelectOption value={2}>{['B', 2]}</NativeSelectOption>
        </>
        <NativeSelectOption value={3}>{() => '不是文字'}</NativeSelectOption>
      </NativeSelect>
    )
    const options = screen.getAllByRole('option')
    expect(options.map(o => o.textContent)).toEqual(['A店', 'B2', ''])
    expect(screen.getByLabelText('店家')).toHaveValue('1')
    fireEvent.change(screen.getByLabelText('店家'), { target: { value: '0' } })
    expect(onChange.mock.calls[0][0].target).toEqual({ value: 1, name: 'store' })
  })

  it('NativeSelectOption 單獨渲染時不輸出任何東西（只是資料容器）', () => {
    const { container } = render(<NativeSelectOption value="x">x</NativeSelectOption>)
    expect(container.innerHTML).toBe('')
  })

  it('沒有 onChange 時改選不拋錯；選到不存在的索引回傳空字串', () => {
    const { rerender } = render(
      <NativeSelect aria-label="s" value="a">
        <NativeSelectOption value="a">A</NativeSelectOption>
      </NativeSelect>
    )
    expect(() => fireEvent.change(screen.getByLabelText('s'), { target: { value: '0' } })).not.toThrow()
    const onChange = jest.fn()
    rerender(
      <NativeSelect aria-label="s" value="zzz" onChange={onChange}>
        <NativeSelectOption value="a">A</NativeSelectOption>
      </NativeSelect>
    )
    // 沒有對應選項時顯示空的隱藏 placeholder（沒給 placeholder 時文字為空）
    expect(screen.getByLabelText('s')).toHaveValue('')
    // 防呆：瀏覽器只會回報存在的選項索引；若索引對不到選項（例如選項在事件前被換掉）回傳空字串而不是拋錯
    const select = screen.getByLabelText('s')
    Object.defineProperty(select, 'value', { configurable: true, get: () => '9' })
    fireEvent.change(select)
    expect(onChange.mock.calls[0][0].target.value).toBe('')
  })

  it('外框標籤：required 顯示星號、error 時標籤與外框轉紅並標 aria-invalid', () => {
    const { rerender } = render(
      <NativeSelect label="付款方式" required value="">
        <NativeSelectOption value="cash">現金</NativeSelectOption>
      </NativeSelect>
    )
    const label = screen.getByText('付款方式')
    expect(label.className).toContain('text-text-secondary')
    expect(label.querySelector('.text-danger').textContent).toBe(' *')
    expect(screen.getByLabelText(/付款方式/)).not.toHaveAttribute('aria-invalid')
    rerender(
      <NativeSelect label="付款方式" error value="">
        <NativeSelectOption value="cash">現金</NativeSelectOption>
      </NativeSelect>
    )
    expect(screen.getByText('付款方式').className).toContain('text-danger')
    const select = screen.getByLabelText('付款方式')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select.className).toContain('border-danger')
  })
})

describe('TextField／InputBase', () => {
  it('ref 同時交給 inputRef、InputProps.inputProps.ref 與 inputProps.ref', () => {
    const a = React.createRef()
    const b = jest.fn()
    const c = React.createRef()
    render(<TextField label="金額" inputRef={a} InputProps={{ inputProps: { ref: b } }} inputProps={{ ref: c }} />)
    const input = screen.getByLabelText('金額')
    expect(a.current).toBe(input)
    expect(b).toHaveBeenCalledWith(input)
    expect(c.current).toBe(input)
  })

  it('InputProps 為 null 時不拋錯；small 為 32px、disabled 外框不可點', () => {
    render(<TextField label="金額" InputProps={null} size="small" disabled />)
    const box = screen.getByLabelText('金額').parentElement
    expect(box.className).toContain('h-8')
    expect(box.className).toContain('pointer-events-none')
  })

  it('multiline 預設 2 列、maxRows 限制最大高度', () => {
    render(<TextField label="備註" multiline maxRows={4} />)
    const textarea = screen.getByLabelText('備註')
    expect(textarea).toHaveAttribute('rows', '2')
    expect(textarea.style.maxHeight).toBe('96px')
  })

  it('error 時標籤轉紅；沒有 error 時 helperText 為一般說明色', () => {
    const { rerender } = render(<TextField label="代號" error />)
    expect(screen.getByText('代號').className).toContain('text-danger')
    rerender(<TextField label="代號" helperText="最多 10 字" />)
    expect(screen.getByText('最多 10 字').className).toContain('text-text-tertiary')
  })

  it('InputBase 的 inputProps.ref 也拿到輸入元素；點輸入框本身不重複聚焦', () => {
    const ref = React.createRef()
    const onClick = jest.fn()
    render(<InputBase aria-label="搜尋" inputProps={{ ref, className: 'x' }} onClick={onClick} />)
    const input = screen.getByRole('textbox')
    expect(ref.current).toBe(input)
    expect(input.className).toContain('x')
    fireEvent.click(input)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('Slider：依 step 修整浮點誤差', () => {
  const change = (props, raw) => {
    const onChange = jest.fn()
    const utils = render(<Slider aria-label="z" value={0} min={0} max={10} onChange={onChange} {...props} />)
    fireEvent.change(screen.getByLabelText('z'), { target: { value: raw } })
    utils.unmount()
    return onChange.mock.calls[0] && onChange.mock.calls[0][1]
  }

  it('step=0.1 時四捨五入到一位小數、整數 step 取整數', () => {
    expect(change({ step: 0.1 }, '1.2000000476837158')).toBe(1.2)
    expect(change({ step: 1 }, '3')).toBe(3)
  })

  it('科學記號的 step（1e-7）依指數決定小數位數；step=any 原值回傳', () => {
    expect(change({ step: 1e-7, max: 1 }, '0.0000003')).toBe(3e-7)
    expect(change({ step: 'any' }, '2.5')).toBe(2.5)
  })

  it('防呆：非數字值原樣回傳 NaN、無法解析的指數視為整數', () => {
    // type 可由呼叫端覆寫（{...props} 在後），此時值可能不是數字，不應拋錯
    expect(change({ type: 'text' }, 'abc')).toBeNaN()
    expect(change({ type: 'text', step: '1e-x' }, '2.6')).toBe(3)
  })

  it('沒有 onChange 時拖動不拋錯；未指定 max 預設 100', () => {
    render(<Slider aria-label="z" value={5} />)
    expect(screen.getByLabelText('z')).toHaveAttribute('max', '100')
    expect(() => fireEvent.change(screen.getByLabelText('z'), { target: { value: '6' } })).not.toThrow()
  })

  it('valueLabelDisplay=auto：滑過、聚焦、拖曳時顯示數值泡泡，離開後隱藏', () => {
    const { container } = render(<Slider aria-label="z" value={30} min={0} max={0} valueLabelDisplay="auto" />)
    const bubble = container.querySelector('span[aria-hidden="true"]')
    const wrap = container.firstChild
    // max 不大於 min 時泡泡固定在起點，不除以 0
    expect(bubble.style.left).toBe('calc(0% + 8px)')
    const shown = () => bubble.className.includes('opacity-100')
    expect(shown()).toBe(false)
    fireEvent.mouseEnter(wrap)
    expect(shown()).toBe(true)
    fireEvent.mouseLeave(wrap)
    expect(shown()).toBe(false)
    act(() => screen.getByLabelText('z').focus())
    expect(shown()).toBe(true)
    act(() => screen.getByLabelText('z').blur())
    expect(shown()).toBe(false)
    fireEvent.pointerDown(wrap)
    expect(shown()).toBe(true)
    fireEvent.pointerUp(wrap)
    expect(shown()).toBe(false)
  })
})

describe('ToggleGroup／ToggleGroupItem', () => {
  it('沒有 onChange 的群組點擊不拋錯；非 exclusive 且 value 不是陣列時從空陣列開始', () => {
    const { rerender } = render(
      <ToggleGroup value={null}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(() => fireEvent.click(screen.getByText('A'))).not.toThrow()
    const onChange = jest.fn()
    rerender(
      <ToggleGroup value={null} onChange={onChange} fullWidth size="huge">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    )
    fireEvent.click(screen.getByText('A'))
    expect(onChange.mock.calls[0][1]).toEqual(['a'])
    expect(screen.getByRole('group').className).toContain('w-full')
    expect(screen.getByText('A').className).toContain('flex-1')
    // 未知尺寸退回 md
    expect(screen.getByText('A').className).toContain('h-8')
  })

  it('onClick 先收到 (event, value)；preventDefault 時不切換', () => {
    const onChange = jest.fn()
    const onClick = jest.fn((e, v) => {
      if (v === 'b') e.preventDefault()
    })
    render(
      <ToggleGroup exclusive value="a" onChange={onChange}>
        <ToggleGroupItem value="a" onClick={onClick}>
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b" onClick={onClick}>
          B
        </ToggleGroupItem>
      </ToggleGroup>
    )
    fireEvent.click(screen.getByText('B'))
    expect(onClick).toHaveBeenLastCalledWith(expect.anything(), 'b')
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('A'))
    expect(onChange).toHaveBeenCalledWith(expect.anything(), null)
  })

  it('單獨使用（篩選鈕）：自帶 ui-root、selected 時主題色，onChange 以 (event, value) 呼叫', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <ToggleGroupItem value="vip" selected onChange={onChange}>
        VIP
      </ToggleGroupItem>
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('ui-root')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn.className).toContain('text-accent')
    fireEvent.click(btn)
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'vip')
    rerender(<ToggleGroupItem value="vip">VIP</ToggleGroupItem>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button').className).toContain('bg-surface-hover')
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })

  it('群組停用時每個項目都 disabled', () => {
    render(
      <ToggleGroup exclusive value="a" disabled onChange={() => {}}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    )
    expect(screen.getByText('A')).toBeDisabled()
  })
})

describe('Slider ref', () => {
  it('Slider 的 ref 指向原生 range input', () => {
    const ref = React.createRef()
    act(() => {
      render(<Slider ref={ref} aria-label="z" value={1} />)
    })
    expect(ref.current).toHaveAttribute('type', 'range')
  })
})

describe('InputBase 外框點擊', () => {
  it('點外框聚焦輸入框；沒有 onClick 時不拋錯', () => {
    const { container } = render(<InputBase aria-label="搜尋" />)
    fireEvent.click(container.firstChild)
    expect(document.activeElement).toBe(screen.getByRole('textbox'))
  })
})
