// 多選篩選（值為陣列）使用正式 ui 元件
import { InputLabel, MenuItem, FormControl, Select } from 'ui/form-control'
import { Checkbox } from 'ui/checkbox'
import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { EmptyState } from 'ui/empty-state'
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { performanceColor } from '../Colors';
import { formatNumber } from 'ui/format'

const selectOptions = [
  { label: '項目消費', value: 'service'},
  { label: '店販銷售', value: 'product'},
  { label: '卡券販賣', value: 'ticketSell'},
  { label: '卡券使用', value: 'ticketUse'},
  { label: '會員卡銷售', value: 'membership'}
]

const PerformanceDetail = ({
  data, dataType, setDataType, sortType, setSortType
}) => {
  const PerformanceTrendBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // 依線的順序上色後由大到小排（先複製，原本直接改 recharts 傳入的 payload，且在檢查 payload 是否存在之前）
      const rows = payload.map((d, i) => ({ ...d, color: performanceColor[i % 30] })).sort((a, b) => b.value - a.value)
      const sum = rows.reduce((a, b) => a + b.value, 0)
      const proportion = value => {
        return (value / sum) ? `${Math.round(value / sum * 10000) / 100}%` : ''
      }
      return (
        <div className="min-w-[150px] p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)] flex flex-col [&_.header]:flex [&_.header]:gap-[30px] [&_.header]:w-full [&_.header]:justify-between [&_.header]:mb-[10px] [&_.content]:max-h-[350px] [&_.content]:overflow-y-auto [&_.row]:flex [&_.row]:gap-[10px] [&_.row]:text-[14px] [&_.row]:items-center">
          <div className='header'>
            <div>{label}</div>
            <div>總和:{formatNumber(sum)}</div>
          </div>
          <div className='content'>
            {rows.map(({ name, value, color }) => (
              <div className='row' style={{ color: color }} key={`${name}-${value}`}>
                <span style={{ maxWidth: 100, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}:</span>
                <span>{formatNumber(value)}</span>
                <span>{proportion(value)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const performanceTrendBar = () => {
    // 每位設計師一條線：取所有月份出現過的設計師（原本只看第一個月，第一個月沒有業績的設計師整條線不見）
    const object = []
    data.forEach(month => Object.keys(month).forEach(key => {
      if (key !== 'name' && !object.includes(key)) object.push(key)
    }))
    return object.map((d, i) => <Line key={d} dataKey={d} strokeWidth={2} stroke={performanceColor[i % 30]} />)
  }

  const renderLabel = values => {
    const label = []
    values.forEach(v => {
      const findData = selectOptions.find(({ value }) => value === v)
      label.push(findData.label)
    })
    return label.join(', ')
  }
  
  return (
    <div className="min-w-0 lg:col-span-2">
      <Card className="h-full min-h-[390px] overflow-visible">
        <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="whitespace-nowrap">設計師業績趨勢表</CardTitle>
              <CardDescription className="whitespace-nowrap text-caption">期間內各設計師業績佔比</CardDescription>
            </div>
            <div>
              <ToggleGroup
                size="small"
                exclusive
                value={dataType}
                onChange={(e, v) => v && setDataType(v)}
              >
                <ToggleGroupItem value='designer'>設計師</ToggleGroupItem>
                <ToggleGroupItem value='merchant'>總和</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <div className="flex w-full max-w-[350px] items-center">
            <FormControl fullWidth>
              <InputLabel>篩選</InputLabel>
              <Select
                multiple
                value={sortType}
                label='篩選'
                renderValue={(selected) => renderLabel(selected)}
                onChange={e => setSortType(e.target.value)}
              >
                {selectOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={sortType.includes(value)} />
                    <span className="flex-1">{label}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
          {data.length > 0 ?
            <div style={{ width: '100%', height: 500 }}>
              <ResponsiveContainer>
                <LineChart
                  width={500}
                  height={600}
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis interval='equidistantPreserveStart' dataKey='name' />
                  <YAxis />
                  <Tooltip offset={-20} wrapperStyle={{ zIndex: 99, pointerEvents: '' }} content={<PerformanceTrendBarTooltip />}/>
                  {/* Jason 2026/10/24：圖例加回。字級由 Results 的 .recharts-legend-item-text 規則負責；過長可捲動 */}
                  <Legend wrapperStyle={{ maxHeight: 200, overflowY: 'auto' }} />
                  {performanceTrendBar()}
                </LineChart>
              </ResponsiveContainer>
            </div> :
            <EmptyState title="無資料" className="h-[350px]" />
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(PerformanceDetail)