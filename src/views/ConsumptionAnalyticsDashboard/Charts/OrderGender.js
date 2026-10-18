/** @jsxImportSource @emotion/react */
import { Card, CardContent, Grid } from '@mui/material'
import { gendercolor } from '../Colors';
import React from 'react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  noDataDiv: css({
    width: '100%',
    height: '350px',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center'
  }),
  noData: css({
    fontSize: '24px',
  }),
  gerderWrap: css({
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: '-40px',
    flexWrap: 'no-wrap',
    columnGap: '5px',
    '& div': {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    },
    '& div span': {
      width: 10,
      height: 10,
    },
    [theme.breakpoints.down('sm')]: {
      height: 'fit-content',
      marginLeft: '0px',
    }
  }),
  pieWrap: css({
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    marginLeft: '-20px',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginLeft: '0px',
    }
  }),
  pie: css({
    width: '75%',
    height: '300px',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      minHeight: '200px',
      height: 'fit-contnet',
    }
  }),
  fontSize: css({
    fontSize: '16px',
    whiteSpace: 'nowrap',
  }),
  toolTips: css({
    padding: '12px',
    fontSize: '16px',
    background: 'rgb(var(--background))',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 0 0 1px rgb(63 63 68 / 5%), 0 1px 3px 0 rgb(63 63 68 / 15%)',
    display: 'flex',
    alignItems: 'center',
    '& span': {
      marginRight: '10px',
      width: 10,
      height: 10,
    },
  })
}

const OrderGender = ({ display, data, width }) => {
  const renderOrderGenderRatioLabel = ({
    cx, cy, midAngle, innerRadius,
    outerRadius, index, percentage
  }, isSource = false) => {
    const RADIAN = Math.PI / 180;
    const radius = 20 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        key={`orderGenderRatioText-${index}`}
        x={x}
        y={y}
        fill={isSource ? pieChartColor[index] : gendercolor[index]}
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
        <div css={styles.toolTips}>
          <span style={{ background: payload[0].payload.fill }}></span><p>{`${payload[0].payload.name} ${payload[0].payload.count}單 ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <Grid item md={6} sm={12} xs={12}>
      <Card>
        <CardContent>
          <div>
            <div className='cardTitle'>消費者性別比例</div>
            <div className='subTitle'>期間內(訂單)來客的性別比例</div>
          </div>
          {display ?
            <div css={styles.pieWrap}>
              <div css={styles.pie}>
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
              <div css={styles.gerderWrap}>
                {data.map((d, index) => (
                  <div key={d.name}
                    style={(width < 975 && width >= 900) || (width < 1470 && width >= 1200) ? { fontSize: 14, marginLeft: '20px' } : null}
                    css={styles.fontSize}
                  >
                    <span style={{ background: gendercolor[index] }} />
                    {`${d.name}  ${d.count}單  ${d.percentage}%`}
                  </div>
                ))}
              </div>
            </div> :
            <div css={styles.noDataDiv}><span css={styles.noData}>無資料</span></div>
          }
        </CardContent>
      </Card>
    </Grid>
  )
}

export default React.memo(OrderGender)