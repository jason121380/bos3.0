/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  total: css({
    fontWeight: 'bold',
  }),
}

export default function Results({ moneyFlowDailyReport, displayDate, isMemberShipCardActive, secExcelData }) {
  const [revenueTotals, setRevenueTotals] = useState([])
  const [expenditureTotals, setExpenditureTotals] = useState([])
  const [balanceTotals, setBalanceTotals] = useState([])
  const [reportDisplay, setReportDisplay] = useState([])
  useEffect(() => {
    const excelData = []
    const key = ['科目', ...displayDate, '合計']
    const initRevenueTotals = []
    const initExpenditureTotals = []
    const initBalanceTotals = []
    let reportDisplay = []
    let isMembershipShow
    if (moneyFlowDailyReport !== undefined) {
      const membershipValue = moneyFlowDailyReport.filter(result => result.itemName === "會員卡消費")
      membershipValue.map(d => {
        const isMembershipIsZero = d.moneyFlowRecord.filter(result => result.price === 0)
        if (isMembershipIsZero.length !== d.moneyFlowRecord.length) {
          isMembershipShow = true
        } else if (isMemberShipCardActive) {
          isMembershipShow = true
        } else {
          isMembershipShow = false
        }
      })
      if (isMembershipShow === false) {
        const tmp = moneyFlowDailyReport.filter(result => result.itemName !== "會員卡消費")
        tmp.map(d => {
          reportDisplay.push(d)
        })
      } else {
        moneyFlowDailyReport.map(d => {
          reportDisplay.push(d)
        })
      }
      if (reportDisplay.length > 0) {
        reportDisplay[0].moneyFlowRecord.map(data => {
          initRevenueTotals.push(0)
          initExpenditureTotals.push(0)
        })
        reportDisplay.map((data) => {
          if (data.type === 'REVENUE') {
            data.moneyFlowRecord.map((data2, index2) => {
              initRevenueTotals[index2] += data2.price
            })
          }
          if (data.type === 'EXPENDITURE') {
            data.moneyFlowRecord.map((data2, index2) => {
              initExpenditureTotals[index2] += data2.price
            })
          }
        })
        reportDisplay[0].moneyFlowRecord.map((data, index) => {
          initBalanceTotals.push(initRevenueTotals[index] - Math.abs(initExpenditureTotals[index]))
        })
        setRevenueTotals(initRevenueTotals)
        setExpenditureTotals(initExpenditureTotals)
        setBalanceTotals(initBalanceTotals)
        setReportDisplay(reportDisplay)
      }
    }
    const arr = ['收入合計:', '支出合計:', '結餘合計:']
    reportDisplay.forEach(({ itemName, moneyFlowRecord, type }) => {
      const obj = {}
      obj[key[0]] = itemName
      moneyFlowRecord.forEach(({ price }, i) => {
        obj[key[i + 1]] = type === 'REVENUE' ? price : price > 0 ? `-${price}` : price
      })
      obj.合計 = moneyFlowRecord.reduce((a, b) => a + b.price, 0)
      excelData.push(obj)
    })
    const tidyArr = [initRevenueTotals, initExpenditureTotals, initBalanceTotals]
    tidyArr.forEach((data, i) => {
      const obj = {}
      obj.科目 = arr[i]
      data.forEach((price, i) => {
        obj[key[i + 1]] = price
      })
      obj.合計 = data.reduce((a, b) => a + b, 0)
      excelData.push(obj)
    })
    secExcelData(excelData)
  }, [moneyFlowDailyReport])

  return (
    <TableContainer component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>科目</TableCell>
            {displayDate.map((date, index) => (
              <TableCell key={index}>{date}</TableCell>
            ))}
            <TableCell>合計</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportDisplay.map((data, index) => (
            <TableRow key={index}>
              <TableCell style={{ minWidth: 90, whiteSpace: 'nowrap' }}>{data.itemName}</TableCell>
              {data.moneyFlowRecord.map((data2, index) => (
                <TableCell key={index}>
                  {data.type === 'REVENUE'
                    ? data2.price
                    : data2.price > 0
                      ? `-${data2.price}`
                      : data2.price}
                </TableCell>
              ))}
              <TableCell>
                {data.moneyFlowRecord
                  .map(data2 => data2.price)
                  .reduce((accu, curVal) => (accu += curVal), 0)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell css={styles.total}>收入合計:</TableCell>
            {revenueTotals.map((num, index) => (
              <TableCell key={index}>{num}</TableCell>
            ))}
            <TableCell>
              {revenueTotals.reduce((accu, curVal) => accu + curVal, 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell css={styles.total}>支出合計:</TableCell>
            {expenditureTotals.map((num, index) => (
              <TableCell key={index}>{num > 0 ? `-${num}` : num}</TableCell>
            ))}
            <TableCell>
              {expenditureTotals.reduce((accu, curVal) => accu + curVal, 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell css={styles.total}>結餘合計:</TableCell>
            {balanceTotals.map((num, index) => (
              <TableCell key={index}>{num}</TableCell>
            ))}
            <TableCell>
              {balanceTotals.reduce((accu, curVal) => accu + curVal, 0)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
