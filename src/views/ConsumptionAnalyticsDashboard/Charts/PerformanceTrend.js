import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { pieChartColor } from '../Colors';
import { formatNumber } from 'ui/format'

const PerformanceTrend = ({ data }) => {
  const PerformanceTrendBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sum = payload.reduce((a, b) => a + b.value, 0)
      const proportion = value => {
        return (value / sum) ? `${Math.round(value / sum * 10000) / 100}%` : ''
      }
      return (
        <div className="min-w-[150px] p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)] flex flex-col [&_.header]:flex [&_.header]:gap-[30px] [&_.header]:w-full [&_.header]:justify-between [&_.header]:mb-[10px] [&_.row]:flex [&_.row]:gap-[10px] [&_.row]:text-[14px]">
          <div className='header'>
            <div>{label}</div>
            <div>總和:{formatNumber(sum)}</div>
          </div>
          {payload.map(({ name, value }, i) => (
            <div className='row' style={{ color: pieChartColor[i % 13] }} key={`${name}-${value}`}>
              <span style={{ maxWidth: 100, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}:</span>
              <span>{formatNumber(value)}</span>
              <span>{proportion(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  const performanceTrendBar = () => {
    const object = Object.keys(data[0]).filter(d => d !== 'name')
    return object.map((d, i) => <Bar key={d} dataKey={d} stackId='a' fill={pieChartColor[i % 13]} />)
  }
  return (
    <div className="min-w-0">
      <Card className="h-full min-h-[390px] overflow-visible">
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <CardTitle className="whitespace-nowrap">設計師業績趨勢表</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內各設計師業績佔比</CardDescription>
          </div>
          {data.length > 0 ?
            <div style={{ width: '105%', height: 320 + ((Object.keys(data[0]).length / 4) * 20), marginLeft: '-20px' }}>
              <ResponsiveContainer>
                <BarChart
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
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<PerformanceTrendBarTooltip />} />
                  {/* 圖例：原本 <Legend css={…}> 經 emotion jsx 包裝後元素型別不再是 recharts Legend，圖表找不到而從未顯示；移除 emotion 後為維持畫面等價一併移除（要顯示圖例屬產品變更） */}
                  {performanceTrendBar()}
                </BarChart>
              </ResponsiveContainer>
            </div> :
            <EmptyState title="無資料" className="h-[350px]" />
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(PerformanceTrend)