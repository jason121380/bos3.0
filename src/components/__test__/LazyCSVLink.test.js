// 保護 LazyCSVLink（按下才產生 CSV 的下載連結，效能修正 A）：
// - 產生的網址與 react-csv CSVLink（預設 BOM、逗號、雙引號）逐字相同，含 headers 參數
// - render 時不呼叫 getData，按下才呼叫；連結仍是 <a download>，檔名、className、ref、onClick 照常
// - 瀏覽器有 Blob 網址時，上一次的網址在下次按下與卸載時釋放（CSVLink 每次 render 建新網址且從不釋放）
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CSVLink } from 'react-csv'
import LazyCSVLink, { buildCsvUri } from 'components/LazyCSVLink'

afterEach(cleanup)

const ROWS = [
  { 帳單編號: '#A001 (S-1)', 客戶: '陳*姐 0912***678', 金額: 1600, 備註: '有,逗號"與引號"' },
  { 帳單編號: '#A002', 客戶: '王* 0922***222', 金額: -34, 備註: null },
  { 帳單編號: '#A003', 客戶: undefined, 金額: 0, 備註: '' },
]

// 點擊後讀 href；擋下 jsdom 的導覽（未實作）
const clickAndRead = link => {
  const stop = event => event.preventDefault()
  window.addEventListener('click', stop)
  try {
    fireEvent.click(link)
  } finally {
    window.removeEventListener('click', stop)
  }
  return link.getAttribute('href')
}

describe('LazyCSVLink', () => {
  it('按下後的網址與 react-csv CSVLink 逐字相同', () => {
    render(
      <>
        <CSVLink data={ROWS} filename="a.csv">
          原本
        </CSVLink>
        <LazyCSVLink getData={() => ROWS} filename="a.csv">
          新版
        </LazyCSVLink>
      </>
    )
    const expected = screen.getByText('原本').getAttribute('href')
    expect(expected.indexOf('data:text/csv;charset=utf-8,﻿"帳單編號"')).toBe(0)
    expect(clickAndRead(screen.getByText('新版'))).toBe(expected)
  })

  it('帶 headers 時也與 CSVLink 相同', () => {
    const headers = [
      { label: '編號', key: '帳單編號' },
      { label: '金額', key: '金額' },
    ]
    render(
      <>
        <CSVLink data={ROWS} headers={headers}>
          原本
        </CSVLink>
        <LazyCSVLink getData={() => ROWS} headers={headers}>
          新版
        </LazyCSVLink>
      </>
    )
    expect(clickAndRead(screen.getByText('新版'))).toBe(screen.getByText('原本').getAttribute('href'))
    expect(buildCsvUri(ROWS, headers)).toBe(screen.getByText('原本').getAttribute('href'))
  })

  it('render 時不呼叫 getData，按下才呼叫；檔名、className、ref、onClick 照常', () => {
    const getData = jest.fn(() => ROWS)
    const onClick = jest.fn()
    const ref = React.createRef()
    const { rerender } = render(
      <LazyCSVLink getData={getData} filename="帳單列表.csv" className="btn" ref={ref} onClick={onClick}>
        報表匯出
      </LazyCSVLink>
    )
    rerender(
      <LazyCSVLink getData={getData} filename="帳單列表.csv" className="btn" ref={ref} onClick={onClick}>
        報表匯出
      </LazyCSVLink>
    )
    const link = screen.getByText('報表匯出')
    expect(getData).not.toHaveBeenCalled()
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('download', '帳單列表.csv')
    expect(link).toHaveAttribute('target', '_self')
    expect(link).toHaveClass('btn')
    expect(ref.current).toBe(link)
    clickAndRead(link)
    expect(getData).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
    // 重畫不會把 href 改回去
    rerender(
      <LazyCSVLink getData={getData} filename="帳單列表.csv" className="btn" ref={ref} onClick={onClick}>
        報表匯出
      </LazyCSVLink>
    )
    expect(link.getAttribute('href').indexOf('data:text/csv')).toBe(0)
  })

  describe('瀏覽器支援 Blob 網址時', () => {
    let created
    let revoked
    beforeEach(() => {
      created = 0
      revoked = []
      window.URL.createObjectURL = jest.fn(() => `blob:test/${++created}`)
      window.URL.revokeObjectURL = jest.fn(url => revoked.push(url))
    })
    afterEach(() => {
      delete window.URL.createObjectURL
      delete window.URL.revokeObjectURL
    })

    it('上一次的網址在下次按下與卸載時釋放', () => {
      const { unmount } = render(<LazyCSVLink getData={() => ROWS}>匯出</LazyCSVLink>)
      const link = screen.getByText('匯出')
      expect(window.URL.createObjectURL).not.toHaveBeenCalled()
      expect(clickAndRead(link)).toBe('blob:test/1')
      expect(revoked).toEqual([])
      expect(clickAndRead(link)).toBe('blob:test/2')
      expect(revoked).toEqual(['blob:test/1'])
      unmount()
      expect(revoked).toEqual(['blob:test/1', 'blob:test/2'])
    })

    it('沒按過就卸載時不釋放任何網址', () => {
      const { unmount } = render(<LazyCSVLink getData={() => ROWS}>匯出</LazyCSVLink>)
      unmount()
      expect(window.URL.revokeObjectURL).not.toHaveBeenCalled()
    })
  })
})
