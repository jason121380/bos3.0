/** @jsxImportSource @emotion/react */
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  medals: css({
    fontSize: '19px',
  }),
  sticky: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
    outline: '1px solid rgb(var(--border))'
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid rgb(var(--border))'
  }),
}

// 固定首欄與表頭（原 styles.sticky／stickyRow，改用 tokens 底色）
const STICKY_COL = 'sticky left-0 z-[99] bg-background outline outline-1 outline-border'

function Results({ overAllReport, weekDisplay }) {
  return (
    !!overAllReport.merchantNameList && (
      <Table
        dense
        wrapperClassName="h-[calc(100vh-340px)] overflow-auto"
        className="min-w-[650px]"
        aria-label="a dense table"
      >
        <TableHeader className="sticky top-0 z-[100]">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY_COL} min-w-[115px] bg-surface`}>日期</TableHead>
            {overAllReport.merchantNameList.map((d, index) => {
              return <TableHead numeric key={index}>{d}</TableHead>
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {overAllReport.performanceAnalysis.map((data, index) => {
            return (
              <TableRow key={index}>
                <TableCell className={`${STICKY_COL} whitespace-nowrap tabular-nums`} key={data.date}>{`${format(new Date(data.date), 'yyyy/MM/dd')}  ${weekDisplay(format(new Date(data.date), 'eeee'))}`}</TableCell>
                {data.merchantPerformance.map((d, index) => {
                  if (d.merchantName === overAllReport.merchantNameList[index]) {
                    return <TableCell numeric key={index}>{formatNumber(d.performance)}</TableCell>
                  } else {
                    const correctData = data.merchantPerformance.filter(d => {
                      return d.merchantName === overAllReport.merchantNameList[index]
                    })
                    return <TableCell numeric key={index}>{formatNumber(correctData[0].performance)}</TableCell>
                  }
                })
                }
              </TableRow>
            )
          })}
          <TableRow>
            <TableCell className={`${STICKY_COL} font-bold`}>區間合計</TableCell>
            {overAllReport.performanceSummary.map((d, index) => {
              if (d.merchantName === overAllReport.merchantNameList[index]) {
                  return <TableCell numeric key={index} className="font-bold">{formatNumber(Math.round(d.performance))}</TableCell>
                } else {
                  const correctData = overAllReport.performanceSummary.filter(d => {
                    return d.merchantName === overAllReport.merchantNameList[index]
                  })
                  return <TableCell numeric key={index} className="font-bold">{formatNumber(Math.round(correctData[0].performance))}</TableCell>
                }
            })}
          </TableRow>
          <TableRow>
            <TableCell className={STICKY_COL}>實際工作天數</TableCell>
            {overAllReport.workingDay.map((d, index) => {
              if (d.merchantName === overAllReport.merchantNameList[index]) {
                  return <TableCell numeric key={index}>{formatNumber(d.dayCount)}</TableCell>
                } else {
                  const correctData = overAllReport.workingDay.filter(d => {
                    return d.merchantName === overAllReport.merchantNameList[index]
                  })
                  return <TableCell numeric key={index}>{formatNumber(correctData[0].dayCount)}</TableCell>
                }
            })}
          </TableRow>
          <TableRow>
            <TableCell className={STICKY_COL}>單日平均</TableCell>
            {overAllReport.averagePerformance.map((d, index) => {
              if (d.merchantName === overAllReport.merchantNameList[index]) {
                  return <TableCell numeric key={index}>{formatNumber(d.performance)}</TableCell>
                } else {
                  const correctData = overAllReport.averagePerformance.filter(d => {
                    return d.merchantName === overAllReport.merchantNameList[index]
                  })
                  return <TableCell numeric key={index}>{formatNumber(correctData[0].performance)}</TableCell>
                }
            })}
          </TableRow>
          <TableRow>
            <TableCell className={STICKY_COL}>當月預估</TableCell>
            {overAllReport.expectedPerformanceAllMonth.map((d, index) => {
              if (d.merchantName === overAllReport.merchantNameList[index]) {
                  return <TableCell numeric key={index}>{formatNumber(d.performance)}</TableCell>
                } else {
                  const correctData = overAllReport.expectedPerformanceAllMonth.filter(d => {
                    return d.merchantName === overAllReport.merchantNameList[index]
                  })
                  return <TableCell numeric key={index}>{formatNumber(correctData[0].performance)}</TableCell>
                }
            })}
          </TableRow>
        </TableBody>
      </Table>
    )
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
