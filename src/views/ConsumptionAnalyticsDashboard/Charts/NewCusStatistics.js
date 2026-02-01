/** @jsxImportSource @emotion/react */
import { Card, CardContent, Grid } from '@mui/material'
import React from 'react'
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { performanceColor } from '../Colors';
import { theme } from '../../../theme'
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
  gerderWrap: css({
    maxHeight: '300px',
    overflow: 'auto',
    flexDirection: 'column',
    marginLeft: '-30px',
    display: 'flex',
    flexWrap: 'nowrap',
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
      marginLeft: '20px',
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
    fontSize: '14px',
    whiteSpace: 'nowrap',
    display: 'flex',
    '& span': {
      flexShrink: 0
    }
  }),
  toolTips: css({
    padding: '12px',
    fontSize: '16px',
    background: '#fff',
    color: 'black',
    borderRadius: '5px',
    boxShadow: '0 0 0 1px rgb(63 63 68 / 5%), 0 1px 3px 0 rgb(63 63 68 / 15%)',
    display: 'flex',
    flexDirection: 'column',
  }),
}

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
        <div css={styles.toolTips}>
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
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <div>
            <div className='cardTitle'>新客比例</div>
            <div className='subTitle'>期間新客來數比例</div>
          </div>
          {data.length ?
            <div css={styles.pieWrap2}>
              <div css={styles.pie}>
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
              <div css={styles.gerderWrap}>
                {data.map(({ designer, newCusTotalCount, newCusPercentage }, index) => (
                  <div key={`${designer ? designer.id : '未設定'}`}
                    // style={(width < 975 && width >= 900) || (width < 1470 && width >= 1200) ? { fontSize: 14, marginLeft: '20px' } : null}
                    css={styles.fontSize}
                  >
                    <span style={{ background: performanceColor[index % 30] }} />
                    {`${designer ? designer.name : '未設定'}  ${newCusTotalCount}人  ${newCusPercentage}%`}
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

export default React.memo(NewCusStatistics)