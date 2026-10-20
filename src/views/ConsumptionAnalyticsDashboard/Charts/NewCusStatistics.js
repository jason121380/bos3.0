import { Card, CardContent, CardDescription, CardTitle } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import React from 'react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { gendercolor, performanceColor } from '../Colors';

const NewCusStatistics = ({ data, width }) => {
  const renderOrderGenderRatioLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius,
    index, newCusPercentage
  }, isSource = false) => {
    const RADIAN = Math.PI / 180;
    const radius = 20 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        key={`newCusStatisticsText-${index}`}
        x={x}
        y={y}
        fill={isSource ? performanceColor[index % 30] : gendercolor[index]}
        fontSize={width < 980 && width >= 900 ? '14' : width < 450 ? '12' : '16'}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${newCusPercentage}%`}
      </text>
    );
  };

  const CustomOrderGenderRatioTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { male, female, unknown } = payload[0].payload.newCusGenderRatio
      return (
        <div className="p-[12px] text-[16px] [background:rgb(var(--background))] text-[color:black] rounded-[5px] [box-shadow:0_0_0_1px_rgb(63_63_68_/_5%),0_1px_3px_0_rgb(63_63_68_/_15%)] flex flex-col">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ background: payload[0].payload.fill, marginRight: '10px', width: 10, height: 10 }}></span>
            <p>{`${payload[0].payload.designer ? payload[0].payload.designer.name : '未設定'} - 共${payload[0].payload.newCusTotalCount}人`}</p>
          </div>

          <div style={{ marginLeft: 20 }}>{`男:${male.count}人   ${male.percentage}%`}</div>
          <div style={{ marginLeft: 20 }}>{`女:${female.count}人   ${female.percentage}%`}</div>
          <div style={{ marginLeft: 20 }}>{`未知:${unknown.count}人   ${unknown.percentage}%`}</div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-w-0 lg:col-span-2">
      <Card className="h-full min-h-[390px]">
        <CardContent className="flex flex-col gap-4 p-4">
          <div>
            <CardTitle className="whitespace-nowrap">新客比例</CardTitle>
            <CardDescription className="whitespace-nowrap text-caption">期間新客來數比例</CardDescription>
          </div>
          {data.length ?
            <div className="flex h-full items-center ml-[-20px] max-[700px]:flex-col">
              <div className="w-[75%] h-[300px] max-[599.95px]:w-full max-[599.95px]:min-h-[200px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      dataKey="newCusPercentage"
                      data={data}
                      outerRadius={width < 1330 && width >= 900 ? 90 : width < 450 ? 80 : 120}
                      fill="#8884d8"
                      label={e => renderOrderGenderRatioLabel(e, true)}
                    >
                      {data.map((e, index) => (
                        <Cell key={`newCusStatistics-${index}`} fill={performanceColor[index % 30]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomOrderGenderRatioTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="max-h-[300px] overflow-auto flex-col ml-[-30px] flex flex-nowrap gap-x-[5px] [&_div]:flex [&_div]:items-center [&_div]:gap-[10px] [&_div_span]:w-[10px] [&_div_span]:h-[10px] max-[599.95px]:h-fit max-[599.95px]:ml-[20px]">
                {data.map(({ designer, newCusTotalCount, newCusPercentage }, index) => (
                  <div key={`${designer ? designer.id : '未設定'}`}
                    // style={(width < 975 && width >= 900) || (width < 1470 && width >= 1200) ? { fontSize: 14, marginLeft: '20px' } : null}
                    className="text-[14px] whitespace-nowrap flex [&_span]:shrink-0"
                  >
                    <span style={{ background: performanceColor[index % 30] }} />
                    {`${designer ? designer.name : '未設定'}  ${newCusTotalCount}人  ${newCusPercentage}%`}
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

export default React.memo(NewCusStatistics)