// 版本更新紀錄改為前端靜態清單：新的紀錄在最上面，歷史 18 筆的標題、版本、日期、內文與匯出檔相同。
import { format } from 'date-fns'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderPage, loginAs, callsOf } from '../../../__tests__/testkit.test'
import SystemUpdateRecord from '..'
import { historicalRecords } from '../historicalRecords'
import { systemUpdateRecordSource, systemUpdateRecords } from '../records'
import { APP_VERSION } from '../../../version'

const displayDate = record => format(record.updateTime, 'yyyy/MM/dd')

describe('靜態清單', () => {
  it('新紀錄在最前面，接著是匯出的 18 筆，日期不改寫到 2026', () => {
    expect(systemUpdateRecordSource).toHaveLength(30)
    expect(systemUpdateRecords).toHaveLength(30)

    const head = systemUpdateRecordSource.slice(0, 13).map(record => [
      record.title,
      record.versionNo,
      record.updateTime,
    ])
    expect(systemUpdateRecordSource[0].versionNo).toBe(APP_VERSION)
    expect(head).toEqual([
      ['2026/10/30 查詢失敗不再整頁錯誤（第二批）', APP_VERSION, '2026-10-30'],
      ['2026/10/30 程式檢查', 'v3.10301600', '2026-10-30'],
      ['2026/10/30 不再整頁重新整理', 'v3.10301527', '2026-10-30'],
      ['2026/10/28 載入畫面', 'v3.10282323', '2026-10-28'],
      ['2026/10/28 頁首與報表篩選統一', 'v3.10282101', '2026-10-28'],
      ['2026/10/28 穩定性與介面修正', 'v3.10282028', '2026-10-28'],
      ['2026/10/26 側欄換欄', 'v3.10260256', '2026-10-26'],
      ['2026/10/26 側欄細項', 'v3.10260211', '2026-10-26'],
      ['2026/10/26 側欄', 'v3.10260058', '2026-10-26'],
      ['2026/10/25 更新', 'v3.10251924', '2026-10-25'],
      ['2026/10/25 元件 UI', 'v3.10251859', '2026-10-25'],
      ['2026/10/25 工程模式', 'v3.10251836', '2026-10-25'],
      ['更新統整', '23.053~23.061', '2023-06-07'],
    ])

    expect(systemUpdateRecordSource.slice(12)).toEqual(historicalRecords)
    expect(historicalRecords.map(record => record.updateTime)).toEqual([
      '2023-06-07',
      '2023-04-21',
      '2023-02-13',
      '2022-12-02',
      '2022-10-21',
      '2022-10-03',
      '2022-09-19',
      '2022-09-08',
      '2022-09-05',
      '2022-08-28',
      '2022-08-19',
      '2022-08-12',
      '2022-08-03',
      '2022-08-02',
      '2022-08-01',
      '2022-07-29',
      '2022-07-28',
      '2022-07-27',
    ])
    expect(historicalRecords.find(record => record.versionNo === '22.399').title).toBe('10/04 - 10/21 更新')
    expect(historicalRecords.find(record => record.versionNo === '22.386').content).toContain('```mermaid')

    expect(systemUpdateRecords.slice(0, 13).map(record => [record.title, displayDate(record)])).toEqual([
      ['2026/10/30 查詢失敗不再整頁錯誤（第二批）', '2026/10/30'],
      ['2026/10/30 程式檢查', '2026/10/30'],
      ['2026/10/30 不再整頁重新整理', '2026/10/30'],
      ['2026/10/28 載入畫面', '2026/10/28'],
      ['2026/10/28 頁首與報表篩選統一', '2026/10/28'],
      ['2026/10/28 穩定性與介面修正', '2026/10/28'],
      ['2026/10/26 側欄換欄', '2026/10/26'],
      ['2026/10/26 側欄細項', '2026/10/26'],
      ['2026/10/26 側欄', '2026/10/26'],
      ['2026/10/25 更新', '2026/10/25'],
      ['2026/10/25 元件 UI', '2026/10/25'],
      ['2026/10/25 工程模式', '2026/10/25'],
      ['更新統整', '2023/06/07'],
    ])
    expect(displayDate(systemUpdateRecords.find(record => record.versionNo === '22.399'))).toBe('2022/10/21')
    expect(displayDate(systemUpdateRecords[systemUpdateRecords.length - 1])).toBe('2022/07/27')
  })
})

describe('清單頁', () => {
  beforeEach(() => {
    loginAs()
  })
  afterEach(cleanup)

  it('直接畫出靜態清單，不查後端，也不提供新增、編輯、刪除', async () => {
    const { settle, calls, container } = renderPage(<SystemUpdateRecord />, { route: '/system-update-record' })
    await settle()

    expect(screen.getByRole('heading', { name: '版本更新紀錄' })).toBeInTheDocument()
    const titles = Array.from(container.querySelectorAll('h2')).map(node => node.textContent)
    expect(titles).toHaveLength(30)
    expect(titles.slice(0, 13)).toEqual([
      '2026/10/30 查詢失敗不再整頁錯誤（第二批）',
      '2026/10/30 程式檢查',
      '2026/10/30 不再整頁重新整理',
      '2026/10/28 載入畫面',
      '2026/10/28 頁首與報表篩選統一',
      '2026/10/28 穩定性與介面修正',
      '2026/10/26 側欄換欄',
      '2026/10/26 側欄細項',
      '2026/10/26 側欄',
      '2026/10/25 更新',
      '2026/10/25 元件 UI',
      '2026/10/25 工程模式',
      '更新統整',
    ])
    expect(screen.getAllByText('更新日期:2026/10/26').length).toBeGreaterThan(0)
    expect(screen.getAllByText('更新日期:2026/10/25').length).toBeGreaterThan(0)
    expect(screen.getAllByText('更新日期:2023/06/07').length).toBeGreaterThan(0)
    expect(screen.getAllByText('更新日期:2022/10/21').length).toBeGreaterThan(0)
    expect(screen.getByText(`版本:${APP_VERSION}`)).toBeInTheDocument()
    expect(screen.getByText('版本:v3.10260211')).toBeInTheDocument()
    expect(screen.getByText('版本:v3.10260058')).toBeInTheDocument()
    expect(screen.getByText('版本:v3.10251924')).toBeInTheDocument()
    expect(screen.getByText('版本:22.399')).toBeInTheDocument()

    expect(screen.getByText(/超過 16 項才換欄/)).toBeInTheDocument()
    expect(screen.getByText(/主側欄 hover 細項改貼近側欄右緣/)).toBeInTheDocument()
    expect(screen.getByText(/細項超過 10 項才換下一欄/)).toBeInTheDocument()
    expect(screen.getByText(/浮層改為貼近視窗上下的滿高/)).toBeInTheDocument()
    expect(screen.getByText(/主側欄收合為圖示欄時，隱藏搜尋/)).toBeInTheDocument()
    expect(screen.getByText(/細項浮層整塊留在視窗內/)).toBeInTheDocument()
    expect(screen.getByText(/不再用上下開合展開子選單/)).toBeInTheDocument()
    expect(screen.getByText(/浮層超過 8 項時改為往右多欄/)).toBeInTheDocument()
    expect(screen.getByText(/日期改由前端以 yyyy\/MM\/dd 顯示（#308）/)).toBeInTheDocument()
    const octoberTitle = titles.indexOf('10/04 - 10/21 更新')
    expect(octoberTitle).toBeGreaterThan(6)
    fireEvent.click(container.querySelectorAll('h2')[octoberTitle])
    expect(screen.getAllByText('更新日期:2022/10/21').length).toBeGreaterThan(0)
    expect(screen.getByText(/設計師業績分析表 要有虛實切換/)).toBeInTheDocument()

    expect(screen.queryByTestId('createSystemUpdate')).toBeNull()
    expect(screen.queryByRole('link', { name: '新增' })).toBeNull()
    expect(screen.queryByRole('link', { name: '編輯版本紀錄' })).toBeNull()
    expect(screen.queryByRole('button', { name: '刪除版本紀錄' })).toBeNull()
    expect(calls).toEqual([])
    expect(callsOf(calls, 'GET_SYSTEM_UPDATE_RECORD')).toEqual([])
    expect(callsOf(calls, 'FETCH_IS_WHITE_LIST')).toEqual([])
  })
})
