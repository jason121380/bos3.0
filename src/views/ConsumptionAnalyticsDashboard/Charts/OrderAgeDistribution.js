import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import React from 'react'
import {
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { pieChartColor } from '../Colors';

const OrderAgeDistribution = ({ display, data, width }) => {
  const renderorderAgeDistributionLabel = ({
    cx, cy, midAngle, innerRadius,
    outerRadius, index, percentage
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = 20 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        key={`orderAgeDistribution-${index}`}
        x={x}
        y={y}
        fill={pieChartColor[index]}
        fontSize={width < 980 && width >= 900 ? '14' : width < 450 ? '12' : '16'}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${percentage}%`}
      </text>
    );
  };
  const CustomOrderAgeDistributionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)] flex items-center [&_span]:mr-[10px] [&_span]:w-[10px] [&_span]:h-[10px]">
          <span style={{ background: payload[0].payload.fill }}></span><p>{`${payload[0].payload.ageRange} (${payload[0].payload.count}人 ${payload[0].payload.percentage}%)`}</p>
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
            <CardTitle className="whitespace-nowrap">消費者年齡分佈</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內(帳單)來客的年齡分佈</CardDescription>
          </div>
          {display ?
            <div className="flex h-full items-center ml-[-20px] max-[599.95px]:flex-col max-[599.95px]:ml-0">
              <div className="w-[75%] h-[300px] max-[599.95px]:w-full max-[599.95px]:min-h-[200px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      dataKey="percentage"
                      nameKey="ageRange"
                      data={data}
                      outerRadius={width < 1330 && width >= 900 ? 90 : width < 450 ? 80 : 120}
                      label={renderorderAgeDistributionLabel}
                      fill='#8cadcb'
                    >
                      {data.map((entry, index) => <Cell key={`agePercentageCell-${index}`} fill={pieChartColor[index % pieChartColor.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomOrderAgeDistributionTooltip />} />
                    <Legend wrapperStyle={{ maxHeight: 200, overflowY: 'auto' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px] flex flex-col justify-center ml-[-40px] gap-x-[5px] [&_div]:flex [&_div]:items-center [&_div]:gap-[10px] [&_div_span]:w-[10px] [&_div_span]:h-[10px] max-[599.95px]:h-fit max-[599.95px]:ml-0">
                {data.map((d, index) => (
                  <div key={`orderAgeDistribution-${index}`} style={width < 975 && width >= 900 ? { fontSize: 14, marginLeft: '20px' } : null} className="text-[16px] whitespace-nowrap"><span style={{ background: pieChartColor[index] }} />{`${d.ageRange} (${d.count}人 ${d.percentage}%)`}</div>
                ))}
              </div>
            </div> :
            <EmptyState title="無資料" className="h-[350px]" />
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(OrderAgeDistribution)