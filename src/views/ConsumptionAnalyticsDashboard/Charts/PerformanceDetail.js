/** @jsxImportSource @emotion/react */
import {
  Card, CardContent, Grid, InputLabel, MenuItem, FormControl,
  ListItemText, Select, Checkbox, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { performanceColor } from '../Colors';
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
    '& .content': {
      maxHeight: 350,
      overflowY: 'auto',
    },
    '& .row': {
      display: 'flex',
      gap: 10,
      fontSize: 14,
      alignItems: 'center'
    }
  }),
  trendLegend: css({
    border: '1px soid black',
    '& .recharts-legend-item-text': {
      fontSize: 14
    }
  }),
  select: css({
    '& .MuiSelect-outlined': {
      padding: '6px 8px !important',
      fontSize: 12
    },
    '& label.MuiFormLabel-root': {
      top: -9
    },
    '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
      transform: 'translate(14px, 2px) scale(0.65)'
    },
  })
}

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
        <div css={styles.trendToolTips}>
          <div className='header'>
            <div>{label}</div>
            <div>總和:{sum}</div>
          </div>
          <div className='content'>
            {payload.map(({ name, value, color }) => (
              <div className='row' style={{ color: color }} key={`${name}-${value}`}>
                <span style={{ maxWidth: 100, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}:</span>
                <span>{value}</span>
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

  const renderLabel = values => {
    const label = []
    values.forEach(v => {
      const findData = selectOptions.find(({ value }) => value === v)
      label.push(findData.label)
    })
    return label.join(', ')
  }
  
  return (
    <Grid item xs={12}>
      <Card style={{ overflow: 'visible' }}>
        <CardContent>
        <Grid container spacing={1}>
          <Grid container flexGrow={1} width='unset' alignItems='center' justifyContent='space-between' item>
            <Grid item>
              <div className='cardTitle'>設計師業績趨勢表</div>
              <div className='subTitle'>期間內各設計師業績佔比</div>
            </Grid>
            <Grid item>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={dataType}
                onChange={(e, v) => v && setDataType(v)}
              >
                <ToggleButton value='designer'>設計師</ToggleButton>
                <ToggleButton value='merchant'>總和</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
          <Grid style={{ maxWidth: 350 }} alignItems='center' container item>
            <FormControl fullWidth css={styles.select}>
              <InputLabel>篩選</InputLabel>
              <Select
                multiple
                value={sortType}
                label='篩選'
                renderValue={(selected) => renderLabel(selected)}
                onChange={e => setSortType(e.target.value)}
              >
                {selectOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={sortType.includes(value)} />
                    <ListItemText primary={label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
                  <Legend
                    wrapperStyle={{ maxHeight: 200, overflowY: 'auto' }}
                    css={styles.trendLegend}
                  />
                  {performanceTrendBar()}
                </LineChart>
              </ResponsiveContainer>
            </div> :
            <div css={styles.noDataDiv}><span className={styles.noData}>無資料</span></div>
          }
        </CardContent>
      </Card>
    </Grid>
  )
}

export default React.memo(PerformanceDetail)