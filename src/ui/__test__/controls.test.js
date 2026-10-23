import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Button } from '../button'

import { Checkbox, CheckboxField, FormControlLabel } from '../checkbox'
import { Switch } from '../switch'
import { Accordion, AccordionDetails, AccordionSummary } from '../accordion'

// 保護什麼：可操作的基本控制項（按鈕、勾選框、開關、可展開區塊）。
// - 圖示按鈕必須有可讀名稱（title／aria-label），否則滑鼠停留與報讀器都不知道用途。
// - inputRef／ref 要拿得到原生 input（react-hook-form 以 inputRef={register} 註冊欄位，拿不到就收不到值）。
// - 停用狀態不得觸發 onChange／展開；鍵盤 Enter／空白鍵要等同點擊。

afterEach(cleanup)

describe('Button：圖示按鈕的名稱', () => {
  it('size=icon 沒給 title 時以 aria-label 補上 title；呼叫端給的 title 優先', () => {
    const { rerender } = render(<Button size="icon" aria-label="刪除" />)
    expect(screen.getByRole('button')).toHaveAttribute('title', '刪除')
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    rerender(<Button size="icon" aria-label="刪除" title="移除此列" />)
    expect(screen.getByRole('button')).toHaveAttribute('title', '移除此列')
  })

  it('asChild 時從子元素（RouterLink）讀 aria-label，且不在連結上加 type', () => {
    render(
      <Button size="icon" asChild>
        <a href="/x" aria-label="前往設定">
          x
        </a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('title', '前往設定')
    expect(link).not.toHaveAttribute('type')
    expect(link.className).toContain('ui-root')
  })

  it('asChild 子元素已有 title、或沒有 aria-label 時不另加 title', () => {
    const { rerender } = render(
      <Button size="icon" asChild>
        <a href="/x" aria-label="前往設定" title="設定">
          x
        </a>
      </Button>
    )
    expect(screen.getByRole('link')).toHaveAttribute('title', '設定')
    rerender(
      <Button size="icon" asChild>
        <a href="/x">x</a>
      </Button>
    )
    expect(screen.getByRole('link')).not.toHaveAttribute('title')
    rerender(<Button size="icon">文字</Button>)
    expect(screen.getByRole('button')).not.toHaveAttribute('title')
  })

  it('一般尺寸不自動加 title；type 可改為 submit', () => {
    render(
      <Button aria-label="儲存" type="submit">
        儲存
      </Button>
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('title')
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

describe('Checkbox／CheckboxField／FormControlLabel', () => {
  it('ref 與 inputRef 可同時是函式或物件，都拿到原生 input', () => {
    const fnRef = jest.fn()
    const objRef = React.createRef()
    render(<Checkbox ref={fnRef} inputRef={objRef} aria-label="全選" />)
    const input = screen.getByLabelText('全選')
    expect(fnRef).toHaveBeenCalledWith(input)
    expect(objRef.current).toBe(input)
  })

  it('沒有 onChange 時仍可點（非受控），indeterminate 同步到原生屬性', () => {
    const { rerender } = render(<Checkbox aria-label="全選" indeterminate />)
    expect(screen.getByLabelText('全選').indeterminate).toBe(true)
    fireEvent.click(screen.getByLabelText('全選'))
    expect(screen.getByLabelText('全選')).toBeChecked()
    rerender(<Checkbox aria-label="全選" />)
    expect(screen.getByLabelText('全選').indeterminate).toBe(false)
  })

  it('CheckboxField 停用時外層標示不可點、input disabled', () => {
    render(<CheckboxField label="同意" disabled />)
    expect(screen.getByLabelText('同意')).toBeDisabled()
    expect(screen.getByText('同意').parentElement.className).toContain('cursor-not-allowed')
  })

  it('FormControlLabel 的 labelPlacement 對應 MUI 的四個方向', () => {
    const { rerender } = render(<FormControlLabel data-testid="l" control={<Checkbox />} label="A" labelPlacement="start" />)
    expect(screen.getByTestId('l').className).toContain('flex-row-reverse')
    rerender(<FormControlLabel data-testid="l" control={<Checkbox />} label="A" labelPlacement="top" />)
    expect(screen.getByTestId('l').className).toContain('flex-col-reverse')
    rerender(<FormControlLabel data-testid="l" control={<Checkbox />} label="A" labelPlacement="bottom" />)
    expect(screen.getByTestId('l').className).toContain('flex-col')
    expect(screen.getByTestId('l').className).not.toContain('flex-col-reverse')
  })
})

describe('Switch：開關', () => {
  it('物件 ref 取得 input；停用時 input disabled、標示不可點；labelPlacement=start 文字在前', () => {
    const ref = React.createRef()
    render(<Switch ref={ref} label="啟用" disabled labelPlacement="start" onChange={() => {}} />)
    const input = screen.getByRole('switch')
    expect(ref.current).toBe(input)
    expect(input).toBeDisabled()
    const label = input.closest('label')
    expect(label.className).toContain('cursor-not-allowed')
    expect(label.className).toContain('flex-row-reverse')
    // 原生 disabled 由瀏覽器擋點擊（jsdom 的 fireEvent 不模擬這點，故不在此點擊）
  })
})

describe('Accordion（新版）', () => {
  it('沒給 expanded 時預設收合，內容隱藏但保持掛載', () => {
    render(
      <Accordion>
        <AccordionSummary>標題</AccordionSummary>
        <AccordionDetails style={{ color: 'red' }}>
          <input aria-label="欄位" defaultValue="保留" />
        </AccordionDetails>
      </Accordion>
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    const details = screen.getByLabelText('欄位').parentElement
    expect(details.style.display).toBe('none')
    expect(details.style.color).toBe('red')
    expect(screen.getByLabelText('欄位')).toHaveValue('保留')
  })

  it('先呼叫呼叫端的 onKeyDown；已 preventDefault 時不再觸發點擊；摘要文字顯示在右側', () => {
    const onClick = jest.fn()
    const onKeyDown = jest.fn(e => {
      if (e.key === 'Enter') e.preventDefault()
    })
    render(
      <Accordion expanded>
        <AccordionSummary onClick={onClick} onKeyDown={onKeyDown} summaryMeta="已填 2 筆">
          標題
        </AccordionSummary>
      </Accordion>
    )
    const summary = screen.getByRole('button')
    expect(screen.getByText('已填 2 筆')).toBeInTheDocument()
    fireEvent.keyDown(summary, { key: 'Enter' })
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
    fireEvent.keyDown(summary, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('沒有 onClick 時按 Enter 不拋錯', () => {
    render(
      <Accordion>
        <AccordionSummary>標題</AccordionSummary>
      </Accordion>
    )
    expect(() => fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })).not.toThrow()
  })
})

describe('Checkbox：inputProps.ref 覆寫', () => {
  // 目前行為：inputProps 展開在 ref 之後，inputProps.ref 會取代元件內部的 ref 回呼——
  // 此時只有 inputProps.ref 拿得到元素，indeterminate 也不會同步（全站目前沒有這種用法）
  it('inputProps.ref 拿到元素，元件內部不拋錯', () => {
    const ref = React.createRef()
    render(<Checkbox aria-label="x" indeterminate inputProps={{ ref }} />)
    expect(ref.current).toBe(screen.getByLabelText('x'))
    expect(screen.getByLabelText('x').indeterminate).toBe(false)
  })
})
