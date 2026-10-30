import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

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
      const membershipValue = moneyFlowDailyReport.filter(result => result.itemName === '會員卡消費')
      membershipValue.forEach(d => {
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
        const tmp = moneyFlowDailyReport.filter(result => result.itemName !== '會員卡消費')
        tmp.forEach(d => {
          reportDisplay.push(d)
        })
      } else {
        moneyFlowDailyReport.forEach(d => {
          reportDisplay.push(d)
        })
      }
      if (reportDisplay.length > 0) {
        reportDisplay[0].moneyFlowRecord.forEach(data => {
          initRevenueTotals.push(0)
          initExpenditureTotals.push(0)
        })
        reportDisplay.forEach(data => {
          if (data.type === 'REVENUE') {
            data.moneyFlowRecord.forEach((data2, index2) => {
              initRevenueTotals[index2] += data2.price
            })
          }
          if (data.type === 'EXPENDITURE') {
            data.moneyFlowRecord.forEach((data2, index2) => {
              initExpenditureTotals[index2] += data2.price
            })
          }
        })
        reportDisplay[0].moneyFlowRecord.forEach((data, index) => {
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
    // 會員卡設定可能比報表晚回來（父層 state 在子層 effect 之後才更新）；設定改變時要重算，否則啟用會員卡的店家會被隱藏「會員卡消費」列（B2 #12）
  }, [moneyFlowDailyReport, isMemberShipCardActive, displayDate, secExcelData])

  return (
    <Table dense aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>科目</TableHead>
          {displayDate.map((date, index) => (
            <TableHead numeric key={index}>
              {date}
            </TableHead>
          ))}
          <TableHead numeric>合計</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportDisplay.map((data, index) => (
          <TableRow key={index}>
            <TableCell style={{ minWidth: 90, whiteSpace: 'nowrap' }}>{data.itemName}</TableCell>
            {data.moneyFlowRecord.map((data2, index) => (
              <TableCell numeric key={index}>
                {formatNumber(data.type === 'REVENUE' ? data2.price : data2.price > 0 ? `-${data2.price}` : data2.price)}
              </TableCell>
            ))}
            <TableCell numeric>
              {formatNumber(data.moneyFlowRecord.map(data2 => data2.price).reduce((accu, curVal) => (accu += curVal), 0))}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="bg-surface/60">
          <TableCell className="font-bold">收入合計:</TableCell>
          {revenueTotals.map((num, index) => (
            <TableCell numeric key={index}>
              {formatNumber(num)}
            </TableCell>
          ))}
          <TableCell numeric>{formatNumber(revenueTotals.reduce((accu, curVal) => accu + curVal, 0))}</TableCell>
        </TableRow>
        <TableRow className="bg-surface/60">
          <TableCell className="font-bold">支出合計:</TableCell>
          {expenditureTotals.map((num, index) => (
            <TableCell numeric key={index}>
              {formatNumber(num > 0 ? `-${num}` : num)}
            </TableCell>
          ))}
          <TableCell numeric>{formatNumber(expenditureTotals.reduce((accu, curVal) => accu + curVal, 0))}</TableCell>
        </TableRow>
        <TableRow className="bg-surface/60">
          <TableCell className="font-bold">結餘合計:</TableCell>
          {balanceTotals.map((num, index) => (
            <TableCell numeric key={index}>
              {formatNumber(num)}
            </TableCell>
          ))}
          <TableCell numeric>{formatNumber(balanceTotals.reduce((accu, curVal) => accu + curVal, 0))}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
