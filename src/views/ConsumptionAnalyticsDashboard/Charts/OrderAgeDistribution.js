/** @jsxImportSource @emotion/react */
import { Card, CardContent, Grid } from '@mui/material'
import React from 'react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { pieChartColor } from '../Colors';
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({
    '& tspan': {
      fontSize: '14px',
    },
    '& div.MuiGrid-root > .MuiPaper-root': {
      minHeight: 390,
      '& .MuiCardContent-root': {
        padding: '8px 12px 12px !important',
        '& .MuiTableContainer-root': {
          marginTop: 16
        }
      }
    },
    '& .recharts-legend-item-text': {
      fontSize: 14
    }
  }),
  cardHead: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  tableCell: css({
    "& td": {
      fontSize: '16px',
      padding: '4px !important'
    }
  }),
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
  pieWrap2: css({
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    marginLeft: '-20px',
    '@media (max-width: 700px)': {
      flexDirection: 'column',
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
  }),
  trendToolTips: css({
    minWidth: 150,
    padding: '12px',
    fontSize: '16px',
    background: 'rgb(var(--background))',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 0 0 1px rgb(63 63 68 / 5%), 0 1px 3px 0 rgb(63 63 68 / 15%)',
    display: 'flex',
    flexDirection: 'column',
    '& .header': {
      display: 'flex',
      gap: 30,
      width: '100%',
      justifyContent: 'space-between',
      marginBottom: 10
    },
    '& .row': {
      display: 'flex', gap: 10,
      fontSize: 14
    }
  }),
  OrderCountTooltip: css({
    padding: '12px',
    fontSize: '16px',
    background: 'rgb(var(--background))',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 0 0 1px rgb(63 63 68 / 5%), 0 1px 3px 0 rgb(63 63 68 / 15%)',
  }),
  trendLegend: css({
    border: '1px soid black',
    '& .recharts-legend-item-text': {
      fontSize: 14
    }
  })
}

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
        <div css={styles.toolTips}>
          <span style={{ background: payload[0].payload.fill }}></span><p>{`${payload[0].payload.ageRange} (${payload[0].payload.count}人 ${payload[0].payload.percentage}%)`}</p>
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
            <div className='cardTitle'>消費者年齡分佈</div>
            <div className='subTitle'>期間內(訂單)來客的年齡分佈</div>
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
                      label={renderorderAgeDistributionLabel}
                      fill='#8cadcb'
                    >
                      {data.map((entry, index) => <Cell key={`agePercentageCell-${index}`} fill={pieChartColor[index % pieChartColor.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomOrderAgeDistributionTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div css={styles.gerderWrap}>
                {data.map((d, index) => (
                  <div key={`orderAgeDistribution-${index}`} style={width < 975 && width >= 900 ? { fontSize: 14, marginLeft: '20px' } : null} css={styles.fontSize}><span style={{ background: pieChartColor[index] }} />{`${d.ageRange} (${d.count}人 ${d.percentage}%)`}</div>
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

export default React.memo(OrderAgeDistribution)