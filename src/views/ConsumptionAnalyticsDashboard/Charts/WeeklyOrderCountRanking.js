/** @jsxImportSource @emotion/react */
import { Card, CardContent, Grid } from '@mui/material'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList
} from "recharts";
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
      >{`${orderCount}單/$${pricePerCount}`}</text>
    )
  }
  const CustomWeeklyOrderCountTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div css={styles.OrderCountTooltip}>
          <p>{payload[0].payload.name}</p>
          <p>{`訂單數:${payload[0].payload.orderCount}`}</p>
          <p>{`單均價:${payload[0].payload.pricePerCount}`}</p>
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
            <div className='cardTitle'>週間來客數排行</div>
            <div className='subTitle'>期間內星期一到日，訂單數比較</div>
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
            <div css={styles.noDataDiv}><span css={styles.noData}>無資料</span></div>
          }
        </CardContent>
      </Card>
    </Grid>
  )
}

export default React.memo(WeeklyOrderCountRanking)