/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from '@mui/material'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { css } from '@emotion/react'

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

function Results({ overAllReport, weekDisplay }) {
  return (
    !!overAllReport.merchantNameList && (
      <TableContainer component={Paper} style={{overflow: 'scroll', height: 'calc(100vh - 340px)'}} >
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow css={styles.stickyRow}>
              <TableCell css={styles.sticky} style={{minWidth: '115px'}}>日期</TableCell>
              {overAllReport.merchantNameList.map((d, index) => {
                return <TableCell key={index}>{d}</TableCell>
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {overAllReport.performanceAnalysis.map((data, index) => {
              return (
                <TableRow key={index}>
                  <TableCell css={styles.sticky} key={data.date}>{`${format(new Date(data.date), 'yyyy/MM/dd')}  ${weekDisplay(format(new Date(data.date), 'eeee'))}`}</TableCell>
                  {data.merchantPerformance.map((d, index) => {
                    if (d.merchantName === overAllReport.merchantNameList[index]) {
                      return <TableCell key={index}>{d.performance}</TableCell>
                    } else {
                      const correctData = data.merchantPerformance.filter(d => {
                        return d.merchantName === overAllReport.merchantNameList[index]
                      })
                      return <TableCell key={index}>{correctData[0].performance}</TableCell>
                    }
                  })
                  }
                </TableRow>
              )
            })}
            <TableRow>
              <TableCell css={styles.sticky} style={{fontWeight: 'bold'}}>區間合計</TableCell>
              {overAllReport.performanceSummary.map((d, index) => {
                if (d.merchantName === overAllReport.merchantNameList[index]) {
                    return <TableCell key={index} style={{fontWeight: 'bold'}}>{Math.round(d.performance)}</TableCell>
                  } else {
                    const correctData = overAllReport.performanceSummary.filter(d => {
                      return d.merchantName === overAllReport.merchantNameList[index]
                    })
                    return <TableCell key={index} style={{fontWeight: 'bold'}}>{Math.round(correctData[0].performance)}</TableCell>
                  }
              })}
            </TableRow>
            <TableRow>
              <TableCell css={styles.sticky}>實際工作天數</TableCell>
              {overAllReport.workingDay.map((d, index) => {
                if (d.merchantName === overAllReport.merchantNameList[index]) {
                    return <TableCell key={index}>{d.dayCount}</TableCell>
                  } else {
                    const correctData = overAllReport.workingDay.filter(d => {
                      return d.merchantName === overAllReport.merchantNameList[index]
                    })
                    return <TableCell key={index}>{correctData[0].dayCount}</TableCell>
                  }
              })}
            </TableRow>
            <TableRow>
              <TableCell css={styles.sticky}>單日平均</TableCell>
              {overAllReport.averagePerformance.map((d, index) => {
                if (d.merchantName === overAllReport.merchantNameList[index]) {
                    return <TableCell key={index}>{d.performance}</TableCell>
                  } else {
                    const correctData = overAllReport.averagePerformance.filter(d => {
                      return d.merchantName === overAllReport.merchantNameList[index]
                    })
                    return <TableCell key={index}>{correctData[0].performance}</TableCell>
                  }
              })}
            </TableRow>
            <TableRow>
              <TableCell css={styles.sticky}>當月預估</TableCell>
              {overAllReport.expectedPerformanceAllMonth.map((d, index) => {
                if (d.merchantName === overAllReport.merchantNameList[index]) {
                    return <TableCell key={index}>{d.performance}</TableCell>
                  } else {
                    const correctData = overAllReport.expectedPerformanceAllMonth.filter(d => {
                      return d.merchantName === overAllReport.merchantNameList[index]
                    })
                    return <TableCell key={index}>{correctData[0].performance}</TableCell>
                  }
              })}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
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
