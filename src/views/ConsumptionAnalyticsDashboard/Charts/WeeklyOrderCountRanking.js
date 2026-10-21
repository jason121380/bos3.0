import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList
} from "recharts";
import { formatNumber } from 'ui/format'

const WeeklyOrderCountRanking = ({ display, data }) => {
  const renderOrderCountLabel = ({ x, y, index, ...d }) => {
    const { orderCount, pricePerCount } = data[index]
    return (
      <text
        x={x + 10}
        y={(y + d.height / 2 + 5)}
        fontSize='12px'
        position='insideRight'
        fill='#eee'
        style={{ textShadow: '0.5px 0.5px 1px #000', fontWeight: '500' }}
      >{`${formatNumber(orderCount)}單/$${formatNumber(pricePerCount)}`}</text>
    )
  }
  const CustomWeeklyOrderCountTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)]">
          <p>{payload[0].payload.name}</p>
          <p>{`帳單數:${formatNumber(payload[0].payload.orderCount)}`}</p>
          <p>{`單均價:${formatNumber(payload[0].payload.pricePerCount)}`}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="min-w-0">
      <Card className="h-full min-h-[390px]">
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <CardTitle className="whitespace-nowrap">週間來客數排行</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內星期一到日，帳單數比較</CardDescription>
          </div>
          {display ?
            <div style={{ width: '100%', height: '320px', marginLeft: '-20px' }}>
              <ResponsiveContainer>
                <BarChart
                  data={data}
                  layout='vertical'
                  margin={{ top: 16 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type='number' />
                  <YAxis label={{ fill: '#faf' }} tickSize={15} dataKey="name" type="category" />
                  <Tooltip cursor={{ fill: 'rgba(0, 136, 254, .2)' }} content={<CustomWeeklyOrderCountTooltip />} />
                  <Bar name='來客數' dataKey="orderCount" fill="#0088FE">
                    <LabelList fill='#fff' content={renderOrderCountLabel} />
                  </Bar>
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

export default React.memo(WeeklyOrderCountRanking)