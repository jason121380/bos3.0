// 多選篩選（值為陣列）：ui/combobox 多選，已選項目顯示成膠囊、清單可打字搜尋（2026/10/30 第三波：全站多選統一）
import { Autocomplete } from 'ui/combobox'
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
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
    payload.forEach((d, i) => payload[i].color = performanceColor[i % 30])
    payload.sort((a, b) => b.value - a.value)
    if (active && payload && payload.length) {
      const sum = payload.reduce((a, b) => a + b.value, 0)
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
            {payload.map(({ name, value, color }) => (
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
    const object = Object.keys(data[0]).filter(d => d !== 'name')
    return object.map((d, i) => <Line key={d} dataKey={d} strokeWidth={2} stroke={performanceColor[i % 30]} />)
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
            <Autocomplete
              multiple
              fullWidth
              disableCloseOnSelect
              options={selectOptions}
              // 依 sortType 的順序帶入，新增的接在後面、移除的拿掉（與原本多選相同，送出的陣列順序不變）
              value={sortType.map(v => selectOptions.find(({ value }) => value === v)).filter(Boolean)}
              isOptionEqualToValue={(option, current) => option.value === current.value}
              getOptionLabel={option => option.label}
              onChange={(e, list) => setSortType(list.map(({ value }) => value))}
              renderOption={({ key, ...props }, option, { selected }) => (
                <li key={option.value} {...props}>
                  <Checkbox checked={selected} />
                  <span className="flex-1">{option.label}</span>
                </li>
              )}
              renderInput={params => <TextField {...params} label="篩選" />}
            />
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