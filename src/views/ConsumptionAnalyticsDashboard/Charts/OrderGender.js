import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { gendercolor } from '../Colors';
import React from 'react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const OrderGender = ({ display, data, width }) => {
  const renderOrderGenderRatioLabel = ({
    cx, cy, midAngle, innerRadius,
    outerRadius, index, percentage
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = 20 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        key={`orderGenderRatioText-${index}`}
        x={x}
        y={y}
        fill={gendercolor[index]}
        fontSize={width < 980 && width >= 900 ? '14' : width < 450 ? '12' : '16'}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${percentage}%`}
      </text>
    );
  };
  const CustomOrderGenderRatioTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)] flex items-center [&_span]:mr-[10px] [&_span]:w-[10px] [&_span]:h-[10px]">
          <span style={{ background: payload[0].payload.fill }}></span><p>{`${payload[0].payload.name} ${payload[0].payload.count}單 ${payload[0].payload.percentage}%`}</p>
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
            <CardTitle className="whitespace-nowrap">消費者性別比例</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間內(帳單)來客的性別比例</CardDescription>
          </div>
          {display ?
            <div className="flex h-full items-center ml-[-20px] max-[599.95px]:flex-col max-[599.95px]:ml-0">
              <div className="w-[75%] h-[300px] max-[599.95px]:w-full max-[599.95px]:min-h-[200px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      dataKey="percentage"
                      data={data}
                      outerRadius={width < 1330 && width >= 900 ? 90 : width < 450 ? 80 : 120}
                      fill="#8884d8"
                      label={renderOrderGenderRatioLabel}
                    >
                      {data.map((e, index) => (
                        <Cell key={`orderGenderRatioCell-${index}`} fill={gendercolor[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomOrderGenderRatioTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px] flex flex-col justify-center ml-[-40px] gap-x-[5px] [&_div]:flex [&_div]:items-center [&_div]:gap-[10px] [&_div_span]:w-[10px] [&_div_span]:h-[10px] max-[599.95px]:h-fit max-[599.95px]:ml-0">
                {data.map((d, index) => (
                  <div key={d.name}
                    style={(width < 975 && width >= 900) || (width < 1470 && width >= 1200) ? { fontSize: 14, marginLeft: '20px' } : null}
                    className="text-[16px] whitespace-nowrap"
                  >
                    <span style={{ background: gendercolor[index] }} />
                    {`${d.name}  ${d.count}單  ${d.percentage}%`}
                  </div>
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

export default React.memo(OrderGender)