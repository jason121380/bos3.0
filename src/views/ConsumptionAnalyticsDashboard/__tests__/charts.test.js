// 保護「消費分析儀表板」各圖表元件：
// ① 沒有資料（或 display=false、回流率全為 0）顯示「無資料」；有資料時圖例文字（筆數、百分比、未設定設計師）正確。
// ② 傳給圖表的資料與設定：圓餅的 dataKey、資料、依視窗寬度的半徑；圓餅標籤的顏色、字級（依視窗寬度）、左右對齊；
//    提示框（tooltip）只在 active 且有 payload 時顯示，內容（名稱、單數、百分比、新客性別比例）正確。
// ③ 設計師業績趨勢：每位設計師一條線，取所有月份出現過的設計師（已修正：原本只看第一個月，第一個月沒業績的設計師整條線不見）；
//    提示框依業績由大到小、顯示總和與佔比（總和為 0 時不顯示佔比），不改動 recharts 傳入的 payload；
//    設計師／總和切換（再按一次不變）、篩選多選的顯示文字。
// ④ 排行榜表格：名次、姓名、手機、數量、金額。
// recharts 以簡化替身代替（只記錄傳入的 props，不畫 SVG），由測試直接呼叫標籤與提示框函式驗證輸出。
import React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import OrderGender from '../Charts/OrderGender'
import ReturnedRatio from '../Charts/ReturnedRatio'
import SourceRatio from '../Charts/SourceRatio'
import NewCusStatistics from '../Charts/NewCusStatistics'
import OrderAgeDistribution from '../Charts/OrderAgeDistribution'
import WeeklyOrderCountRanking from '../Charts/WeeklyOrderCountRanking'
import PerformanceDetail from '../Charts/PerformanceDetail'
import CustomerConsumptionCountRanking from '../Charts/CustomerConsumptionCountRanking'
import CustomerConsumptionPriceRanking from '../Charts/CustomerConsumptionPriceRanking'
import CustomerConsumptionPricePerCountRanking from '../Charts/CustomerConsumptionPricePerCountRanking'
import ProductSalesVolumeRanking from '../Charts/ProductSalesVolumeRanking'
import ProductSalesPriceRanking from '../Charts/ProductSalesPriceRanking'
import { gendercolor, pieChartColor, performanceColor } from '../Colors'

const mockCharts = []
jest.mock('recharts', () => {
  const R = require('react')
  const make = name => props => {
    mockCharts.push({ name, props })
    return R.createElement('div', { 'data-recharts': name }, props.children)
  }
  return Object.fromEntries(
    ['ResponsiveContainer', 'PieChart', 'Pie', 'Cell', 'Tooltip', 'LineChart', 'Line', 'XAxis', 'YAxis', 'CartesianGrid', 'BarChart', 'Bar', 'LabelList'].map(n => [n, make(n)])
  )
})

const last = name => [...mockCharts].reverse().find(c => c.name === name).props
const all = name => mockCharts.filter(c => c.name === name).map(c => c.props)
// 圓餅標籤：右半邊（midAngle 0）靠左對齊、左半邊（180）靠右對齊
const label = (fn, extra) => {
  const el = fn({ cx: 100, cy: 100, innerRadius: 0, outerRadius: 80, midAngle: 0, index: 1, ...extra })
  return el.props
}
const renderTooltip = (props, payload) => {
  const content = last('Tooltip').content
  const utils = render(React.cloneElement(content, { active: true, payload, ...props }))
  return utils
}

beforeEach(() => {
  mockCharts.length = 0
})
afterEach(cleanup)

const GENDER = [
  { name: '男', percentage: 40, count: 4 },
  { name: '女', percentage: 50, count: 5 },
  { name: '未知', percentage: 10, count: 1 },
]

describe('性別、回流率、來源、年齡、新客圓餅圖', () => {
  it('性別：display=false 顯示無資料；有資料時圖例、圓餅資料、依寬度的半徑', () => {
    const { rerender } = render(<OrderGender display={false} data={GENDER} width={1400} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<OrderGender display data={GENDER} width={1500} />)
    expect(screen.getByText('男 4單 40%')).toBeInTheDocument()
    expect(screen.getByText('未知 1單 10%').style.fontSize).toBe('')
    rerender(<OrderGender display data={GENDER} width={1400} />)
    expect(last('Pie')).toMatchObject({ dataKey: 'percentage', data: GENDER, outerRadius: 120 })
    expect(all('Cell').slice(-3).map(c => c.fill)).toEqual(gendercolor)
    rerender(<OrderGender display data={GENDER} width={1000} />)
    expect(last('Pie').outerRadius).toBe(90)
    rerender(<OrderGender display data={GENDER} width={400} />)
    expect(last('Pie').outerRadius).toBe(80)
    // 寬度 900～975、1200～1470 圖例縮小字級
    rerender(<OrderGender display data={GENDER} width={950} />)
    expect(screen.getByText('男 4單 40%')).toHaveStyle('font-size: 14px')
    rerender(<OrderGender display data={GENDER} width={1300} />)
    expect(screen.getByText('男 4單 40%')).toHaveStyle('font-size: 14px')
  })

  it('性別：圓餅標籤顏色、字級、對齊；提示框', () => {
    const { rerender } = render(<OrderGender display data={GENDER} width={1400} />)
    const fn = last('Pie').label
    expect(label(fn, { percentage: 50 })).toMatchObject({ fill: gendercolor[1], fontSize: '16', textAnchor: 'start', children: '50%' })
    expect(label(fn, { midAngle: 180 }).textAnchor).toBe('end')
    rerender(<OrderGender display data={GENDER} width={950} />)
    expect(label(last('Pie').label).fontSize).toBe('14')
    rerender(<OrderGender display data={GENDER} width={400} />)
    expect(label(last('Pie').label).fontSize).toBe('12')
    const { container } = renderTooltip({}, [{ payload: { ...GENDER[1], fill: '#e91e63' } }])
    expect(container.textContent).toBe('女 5單 50%')
    cleanup()
  })

  it.each([
    ['性別', OrderGender, { display: true, data: GENDER }],
    ['回流率', ReturnedRatio, { data: GENDER }],
    ['來源', SourceRatio, { data: GENDER }],
    ['年齡', OrderAgeDistribution, { display: true, data: [{ ageRange: '20-29', count: 3, percentage: 30 }] }],
    ['新客', NewCusStatistics, { data: [{ designer: null, newCusTotalCount: 1, newCusPercentage: 100, newCusGenderRatio: {} }] }],
  ])('%s：提示框只在 active 且有 payload 時顯示', (_, Chart, props) => {
    render(<Chart width={1400} {...props} />)
    const content = last('Tooltip').content
    expect(render(React.cloneElement(content, { active: false, payload: [{ payload: {} }] })).container.textContent).toBe('')
    expect(render(React.cloneElement(content, { active: true, payload: [] })).container.textContent).toBe('')
    expect(render(React.cloneElement(content, { active: true })).container.textContent).toBe('')
  })

  it('回流率：全部 0 筆顯示無資料；有資料時圖例、標籤、提示框', () => {
    const zero = GENDER.map(d => ({ ...d, count: 0 }))
    const { rerender } = render(<ReturnedRatio data={zero} width={1400} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<ReturnedRatio data={GENDER} width={1000} />)
    expect(screen.getByText('女 5單 50%')).toBeInTheDocument()
    expect(last('Pie')).toMatchObject({ dataKey: 'percentage', data: GENDER, outerRadius: 90 })
    expect(label(last('Pie').label, { index: 2, percentage: 10, midAngle: 180 })).toMatchObject({ fill: gendercolor[2], fontSize: '16', textAnchor: 'end', children: '10%' })
    rerender(<ReturnedRatio data={GENDER} width={950} />)
    expect(label(last('Pie').label).fontSize).toBe('14')
    expect(screen.getByText('女 5單 50%')).toHaveStyle('font-size: 14px')
    rerender(<ReturnedRatio data={GENDER} width={400} />)
    expect(last('Pie').outerRadius).toBe(80)
    expect(label(last('Pie').label).fontSize).toBe('12')
    rerender(<ReturnedRatio data={GENDER} width={1300} />)
    expect(screen.getByText('女 5單 50%')).toHaveStyle('font-size: 14px')
    rerender(<ReturnedRatio data={GENDER} width={1500} />)
    expect(screen.getByText('女 5單 50%').style.fontSize).toBe('')
    expect(renderTooltip({}, [{ payload: { ...GENDER[0], fill: '#0088FE' } }]).container.textContent).toBe('男 4單 40%')
  })

  it('來源：全部 0 筆顯示無資料；顏色依設計師色盤、標籤字級', () => {
    const source = [
      { name: 'LINE', count: 3, percentage: 75 },
      { name: '路過', count: 1, percentage: 25 },
    ]
    const { rerender } = render(<SourceRatio data={source.map(d => ({ ...d, count: 0 }))} width={1400} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<SourceRatio data={source} width={1400} />)
    expect(screen.getByText('LINE 3單 75%')).toBeInTheDocument()
    expect(last('Pie')).toMatchObject({ dataKey: 'percentage', data: source, outerRadius: 120 })
    expect(all('Cell').slice(-2).map(c => c.fill)).toEqual(performanceColor.slice(0, 2))
    expect(label(last('Pie').label, { index: 31, percentage: 25 })).toMatchObject({ fill: performanceColor[1], fontSize: '16', textAnchor: 'start', children: '25%' })
    expect(label(last('Pie').label, { midAngle: 180 }).textAnchor).toBe('end')
    rerender(<SourceRatio data={source} width={950} />)
    expect(label(last('Pie').label).fontSize).toBe('14')
    expect(last('Pie').outerRadius).toBe(90)
    rerender(<SourceRatio data={source} width={400} />)
    expect(label(last('Pie').label).fontSize).toBe('12')
    expect(last('Pie').outerRadius).toBe(80)
    expect(renderTooltip({}, [{ payload: { ...source[1], fill: '#000' } }]).container.textContent).toBe('路過 1單 25%')
  })

  it('年齡：display=false 顯示無資料；圖例、標籤（年齡色盤）、提示框', () => {
    const ages = [
      { ageRange: '20-29', count: 3, percentage: 30 },
      { ageRange: '30-39', count: 7, percentage: 70 },
    ]
    const { rerender } = render(<OrderAgeDistribution display={false} data={ages} width={1400} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<OrderAgeDistribution display data={ages} width={1400} />)
    expect(screen.getByText('30-39 (7人 70%)').style.fontSize).toBe('')
    expect(last('Pie')).toMatchObject({ dataKey: 'percentage', data: ages, outerRadius: 120 })
    expect(all('Cell').slice(-2).map(c => c.fill)).toEqual(pieChartColor.slice(0, 2))
    expect(label(last('Pie').label, { percentage: 70 })).toMatchObject({ fill: pieChartColor[1], fontSize: '16', textAnchor: 'start', children: '70%' })
    expect(label(last('Pie').label, { midAngle: 180 }).textAnchor).toBe('end')
    rerender(<OrderAgeDistribution display data={ages} width={950} />)
    expect(screen.getByText('30-39 (7人 70%)')).toHaveStyle('font-size: 14px')
    expect(label(last('Pie').label).fontSize).toBe('14')
    expect(last('Pie').outerRadius).toBe(90)
    rerender(<OrderAgeDistribution display data={ages} width={400} />)
    expect(label(last('Pie').label).fontSize).toBe('12')
    expect(last('Pie').outerRadius).toBe(80)
    expect(renderTooltip({}, [{ payload: { ...ages[0], fill: '#000' } }]).container.textContent).toBe('20-29 (3人 30%)')
  })

  it('新客：沒有資料顯示無資料；未設定設計師、圖例、標籤、提示框含性別比例', () => {
    const ratio = { male: { count: 1, percentage: 25 }, female: { count: 3, percentage: 75 }, unknown: { count: 0, percentage: 0 } }
    const data = [
      { designer: { id: 'u1', name: '小美' }, newCusTotalCount: 4, newCusPercentage: 80, newCusGenderRatio: ratio },
      { designer: null, newCusTotalCount: 1, newCusPercentage: 20, newCusGenderRatio: ratio },
    ]
    const { rerender } = render(<NewCusStatistics data={[]} width={1400} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<NewCusStatistics data={data} width={1400} />)
    expect(screen.getByText('小美 4人 80%')).toBeInTheDocument()
    expect(screen.getByText('未設定 1人 20%')).toBeInTheDocument()
    expect(last('Pie')).toMatchObject({ dataKey: 'newCusPercentage', data, outerRadius: 120 })
    expect(label(last('Pie').label, { newCusPercentage: 20 })).toMatchObject({ fill: performanceColor[1], fontSize: '16', textAnchor: 'start', children: '20%' })
    expect(label(last('Pie').label, { midAngle: 180 }).textAnchor).toBe('end')
    rerender(<NewCusStatistics data={data} width={950} />)
    expect(label(last('Pie').label).fontSize).toBe('14')
    expect(last('Pie').outerRadius).toBe(90)
    rerender(<NewCusStatistics data={data} width={400} />)
    expect(label(last('Pie').label).fontSize).toBe('12')
    expect(last('Pie').outerRadius).toBe(80)
    const tip = renderTooltip({}, [{ payload: { ...data[0], fill: '#000' } }]).container
    expect(tip.textContent).toBe('小美 - 共4人男:1人   25%女:3人   75%未知:0人   0%')
    expect(renderTooltip({}, [{ payload: { ...data[1], fill: '#000' } }]).container.textContent).toMatch(/^未設定 - 共1人/)
  })
})

describe('週間來客數', () => {
  const WEEK = [
    { name: '(一)', week: 'MONDAY', orderCount: 1200, pricePerCount: 1500.5 },
    { name: '(二)', week: 'TUESDAY', orderCount: 3, pricePerCount: 800 },
  ]
  it('display=false 顯示無資料；長條資料、標籤（單數／單均價）、提示框', () => {
    const { rerender } = render(<WeeklyOrderCountRanking display={false} data={WEEK} />)
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<WeeklyOrderCountRanking display data={WEEK} />)
    expect(last('BarChart').data).toBe(WEEK)
    expect(last('Bar')).toMatchObject({ dataKey: 'orderCount', name: '來客數' })
    const text = last('LabelList').content({ x: 10, y: 20, height: 30, index: 0 })
    expect(text.props).toMatchObject({ x: 20, y: 40, children: '1,200單/1,500.5' })
    expect(renderTooltip({}, [{ payload: WEEK[0] }]).container.textContent).toBe('(一)帳單數:1,200單均價:1,500.5')
    cleanup()
    render(<WeeklyOrderCountRanking display data={WEEK} />)
    const content = last('Tooltip').content
    expect(render(React.cloneElement(content, { active: false, payload: [] })).container.textContent).toBe('')
  })
})

describe('設計師業績趨勢', () => {
  const setup = (props = {}) => {
    const setDataType = jest.fn()
    const setSortType = jest.fn()
    const utils = render(
      <PerformanceDetail data={[]} dataType="designer" setDataType={setDataType} sortType={['service', 'product']} setSortType={setSortType} {...props} />
    )
    return { ...utils, setDataType, setSortType }
  }

  it('沒有資料顯示無資料', () => {
    setup()
    expect(screen.getByText('無資料')).toBeInTheDocument()
  })

  // 已修正：原本只取第一個月的設計師畫線
  it('每位設計師一條線（含第一個月沒有業績的設計師），顏色依序', () => {
    setup({
      data: [
        { name: '9月', 小美: 100 },
        { name: '10月', 小美: 200, 阿明: 50 },
      ],
    })
    expect(all('Line').map(l => [l.dataKey, l.stroke])).toEqual([
      ['小美', performanceColor[0]],
      ['阿明', performanceColor[1]],
    ])
    expect(last('LineChart').data).toHaveLength(2)
  })

  it('提示框：依業績由大到小、總和與佔比；總和為 0 時不顯示佔比；不改動傳入的 payload', () => {
    setup({ data: [{ name: '10月', 小美: 100, 阿明: 300 }] })
    const payload = [
      { name: '小美', value: 100 },
      { name: '阿明', value: 300 },
    ]
    const snapshot = JSON.parse(JSON.stringify(payload))
    const tip = renderTooltip({ label: '10月' }, payload).container
    const rows = [...tip.querySelectorAll('.row')]
    expect(rows.map(r => r.textContent)).toEqual(['阿明:30075%', '小美:10025%'])
    expect(rows.map(r => r.style.color)).toEqual(['rgb(233, 30, 99)', 'rgb(0, 136, 254)'])
    expect(tip.querySelector('.header').textContent).toBe('10月總和:400')
    expect(payload).toEqual(snapshot)
    cleanup()
    setup({ data: [{ name: '10月', 小美: 0 }] })
    const zero = renderTooltip({ label: '10月' }, [{ name: '小美', value: 0 }]).container
    expect(zero.querySelector('.row').textContent).toBe('小美:0')
    const content = last('Tooltip').content
    expect(render(React.cloneElement(content, { active: false, payload: [] })).container.textContent).toBe('')
    expect(render(React.cloneElement(content, { active: true })).container.textContent).toBe('')
  })

  it('設計師／總和切換：按另一個才切換；篩選顯示已選項目名稱並可多選', () => {
    const { setDataType, setSortType } = setup()
    fireEvent.click(screen.getByRole('button', { name: '設計師' }))
    expect(setDataType).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '總和' }))
    expect(setDataType).toHaveBeenCalledWith('merchant')
    const select = screen.getByRole('button', { name: /項目消費, 店販銷售/ })
    fireEvent.click(select)
    fireEvent.click(within(screen.getByRole('listbox')).getByText('會員卡銷售'))
    expect(setSortType).toHaveBeenCalledWith(['service', 'product', 'membership'])
  })
})

describe('排行榜表格', () => {
  const customers = [
    { name: '陳小美', cellphone: '0911222333', orderCount: 12, totalPrice: 36000, pricePerCount: 3000 },
    { name: '王五', cellphone: '0922333444', orderCount: 1, totalPrice: 500.5, pricePerCount: 500.5 },
  ]
  const products = [
    { name: '洗髮精', categoryName: '洗護', count: 1200, price: 420000 },
  ]
  it.each([
    ['消費總次數排行', CustomerConsumptionCountRanking],
    ['消費總金額排行', CustomerConsumptionPriceRanking],
    ['消費客單價排行', CustomerConsumptionPricePerCountRanking],
  ])('%s：名次、姓名、手機、帳單數、金額、客單價；沒有資料顯示無資料', (title, Table) => {
    const { rerender } = render(<Table data={[]} />)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<Table data={customers} />)
    const rows = screen.getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell').map(c => c.textContent))
    expect(rows).toEqual([
      ['1.', '陳小美', '0911222333', '12', '36,000', '3,000'],
      ['2.', '王五', '0922333444', '1', '500.5', '500.5'],
    ])
  })

  it.each([
    ['商品銷售數量排行', ProductSalesVolumeRanking],
    ['商品銷售金額排行', ProductSalesPriceRanking],
  ])('%s：名次、商品、類別、數量、總金額；沒有資料顯示無資料', (title, Table) => {
    const { rerender } = render(<Table data={[]} />)
    expect(screen.getByText(title)).toBeInTheDocument()
    expect(screen.getByText('無資料')).toBeInTheDocument()
    rerender(<Table data={products} />)
    const rows = screen.getAllByRole('row').slice(1).map(r => within(r).getAllByRole('cell').map(c => c.textContent))
    expect(rows).toEqual([['1.', '洗髮精', '洗護', '1,200', '420,000']])
  })
})
