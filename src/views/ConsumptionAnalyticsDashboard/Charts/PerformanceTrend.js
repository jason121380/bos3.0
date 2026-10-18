/** @jsxImportSource @emotion/react */
import { Card, CardContent, Grid, } from '@mui/material'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { pieChartColor } from '../Colors';
import { css } from '@emotion/react'

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
  trendLegend: css({
    border: '1px soid black',
    '& .recharts-legend-item-text': {
      fontSize: 14
    }
  })
}

const PerformanceTrend = ({ data }) => {
  const PerformanceTrendBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sum = payload.reduce((a, b) => a + b.value, 0)
      const proportion = value => {
        return (value / sum) ? `${Math.round(value / sum * 10000) / 100}%` : ''
      }
      return (
        <div css={styles.trendToolTips}>
          <div className='header'>
            <div>{label}</div>
            <div>總和:{sum}</div>
          </div>
          {payload.map(({ name, value }, i) => (
            <div className='row' style={{ color: pieChartColor[i % 13] }} key={`${name}-${value}`}>
              <span style={{ maxWidth: 100, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}:</span>
              <span>{value}</span>
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
    <Grid item md={6} sm={12} xs={12}>
      <Card style={{ overflow: 'visible' }}>
        <CardContent>
          <div>
            <div className='cardTitle'>設計師業績趨勢表</div>
            <div className='subTitle'>期間內各設計師業績佔比</div>
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
                  <Legend
                    css={styles.trendLegend}
                  />
                  {performanceTrendBar()}
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

export default React.memo(PerformanceTrend)