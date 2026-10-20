import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Accordion, AccordionSummary, AccordionDetails } from '../accordion-compat'

afterEach(cleanup)

describe('ui/accordion-compat（與 MUI Accordion 相容）', () => {
  // 打帳單各區塊（服務、商品、付款…）以 expanded 受控：點標題只通知外層，展開與否由外層決定
  it('受控：點標題呼叫 onClick 與 onChange(event, !expanded)，不會自行切換', () => {
    const onClick = jest.fn()
    const onChange = jest.fn()
    render(
      <Accordion expanded={false} onChange={onChange}>
        <AccordionSummary onClick={onClick} data-testid="panelService">
          服務項目
        </AccordionSummary>
        <AccordionDetails>內容</AccordionDetails>
      </Accordion>
    )
    const summary = screen.getByTestId('panelService')
    fireEvent.click(summary)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toBe(true)
    expect(summary).toHaveAttribute('aria-expanded', 'false')
  })

  // 收合時內容仍掛載：區塊內欄位的值與 ref 不能因收合而遺失（與 MUI 預設相同）
  it('收合時內容保持掛載、只是不可見；展開時可見', () => {
    const { rerender } = render(
      <Accordion expanded={false}>
        <AccordionSummary>付款</AccordionSummary>
        <AccordionDetails>
          <input aria-label="金額" defaultValue="1200" />
        </AccordionDetails>
      </Accordion>
    )
    const region = screen.getByRole('region', { hidden: true })
    expect(region.closest('.MuiCollapse-root')).toHaveClass('MuiCollapse-hidden')
    expect(screen.getByLabelText('金額')).toHaveValue('1200')
    rerender(
      <Accordion expanded>
        <AccordionSummary>付款</AccordionSummary>
        <AccordionDetails>
          <input aria-label="金額" defaultValue="1200" />
        </AccordionDetails>
      </Accordion>
    )
    expect(region.closest('.MuiCollapse-root')).toHaveClass('MuiCollapse-entered')
    expect(screen.getByRole('button', { name: '付款' })).toHaveAttribute('aria-expanded', 'true')
  })

  // 非受控（defaultExpanded）自行切換；鍵盤 Enter 也能展開（標題是 role=button 的 div）
  it('非受控以 defaultExpanded 起始，點擊與 Enter 可切換', () => {
    render(
      <Accordion>
        <AccordionSummary>備註</AccordionSummary>
        <AccordionDetails>內容</AccordionDetails>
      </Accordion>
    )
    const summary = screen.getByRole('button', { name: '備註' })
    expect(summary).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(summary)
    expect(summary).toHaveAttribute('aria-expanded', 'true')
    fireEvent.keyDown(summary, { key: 'Enter' })
    expect(summary).toHaveAttribute('aria-expanded', 'false')
  })
})
