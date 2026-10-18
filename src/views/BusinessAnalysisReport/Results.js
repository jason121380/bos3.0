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
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
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

function Results({ data, isServiceTicketMerged, isMemberShipCardActive, bonusDisplay }) {
  return (
    <TableContainer component={Paper} className="BusinessAnalysisReportTable">
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow css={styles.stickyRow}>
            <TableCell css={styles.sticky}>營業日期</TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell>營業總業績</TableCell>
                <TableCell>店販消費</TableCell>
                {isMemberShipCardActive && <TableCell>會員卡消費</TableCell>}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell>服務消費</TableCell>
                <TableCell>店販消費</TableCell>
                {isMemberShipCardActive && <TableCell>會員卡消費</TableCell>}
                <TableCell>卡券使用(入業績)</TableCell>
                <TableCell>卡券販賣(入業績)</TableCell>
              </Fragment>
            )}

            <TableCell>業績收入</TableCell>
            <TableCell>卡券販賣(不入業績)</TableCell>
            <TableCell>入金儲值(不入業績)</TableCell>
            <TableCell>卡券使用(-)</TableCell>
            <TableCell>第三方卡券(-)</TableCell>
            <TableCell>其他付款方式(-)</TableCell>
            <TableCell>入金使用(-)</TableCell>
            {bonusDisplay && <TableCell>點數折抵金額(-)</TableCell>}
            <TableCell>營業現金應收</TableCell>
            <TableCell>現金收支收入</TableCell>
            <TableCell>現金收支支出(-)</TableCell>
            <TableCell>員工借支</TableCell>
            <TableCell>現金結存</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.data.map(row => (
            <TableRow key={row.date}>
              <TableCell css={styles.sticky}>{format(row.date, 'yyyy/MM/dd')}</TableCell>
              {isServiceTicketMerged ? (
                <Fragment>
                  <TableCell>
                    {Math.round(row.service + row.usedTicket + row.ticketSellIntoPerformance)}
                  </TableCell>
                  <TableCell>{Math.round(row.product)}</TableCell>
                  {isMemberShipCardActive && <TableCell>{Math.round(row.membership)}</TableCell>}
                </Fragment>
              ) : (
                <Fragment>
                  <TableCell>{Math.round(row.service)}</TableCell>
                  <TableCell>{Math.round(row.product)}</TableCell>
                  {isMemberShipCardActive && <TableCell>{Math.round(row.membership)}</TableCell>}
                  <TableCell>{roundDecimal(row.usedTicket)}</TableCell>
                  <TableCell>{Math.round(row.ticketSellIntoPerformance)}</TableCell>
                </Fragment>
              )}

              <TableCell>{Math.round(row.performanceIncome)}</TableCell>
              <TableCell>{Math.round(row.ticketSellNotIntoPerformance)}</TableCell>
              <TableCell>{Math.round(row.walletDeposit)}</TableCell>
              <TableCell>{roundDecimal(row.usedTicketForDecount)}</TableCell>
              <TableCell>{Math.round(row.thirdPartTicketForDecount)}</TableCell>
              <TableCell>{Math.round(row.otherPayWayForDecount)}</TableCell>
              <TableCell>{Math.round(row.walletUsedForDecount)}</TableCell>
              {bonusDisplay && <TableCell>{row.bonusDecountForReport}</TableCell>}
              <TableCell>{Math.round(row.businessCash)}</TableCell>
              <TableCell>{Math.round(row.cashRevenue)}</TableCell>
              <TableCell>{Math.round(row.cashExpenditure)}</TableCell>
              <TableCell>{Math.round(row.expenditure)}</TableCell>
              <TableCell>{Math.round(row.cashBalance)}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell css={styles.sticky}>
              <b>合計</b>
            </TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell>
                  {Math.round(
                    data.summary.service +
                      data.summary.usedTicket +
                      data.summary.ticketSellIntoPerformance
                  )}
                </TableCell>
                <TableCell>{Math.round(data.summary.product)}</TableCell>
                {isMemberShipCardActive && <TableCell>{Math.round(data.summary.membership)}</TableCell>}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell>{Math.round(data.summary.service)}</TableCell>
                <TableCell>{Math.round(data.summary.product)}</TableCell>
                {isMemberShipCardActive && <TableCell>{Math.round(data.summary.membership)}</TableCell>}
                <TableCell>{Math.round(data.summary.usedTicket)}</TableCell>
                <TableCell>{Math.round(data.summary.ticketSellIntoPerformance)}</TableCell>
              </Fragment>
            )}
            <TableCell>{Math.round(data.summary.performanceIncome)}</TableCell>
            <TableCell>{Math.round(data.summary.ticketSellNotIntoPerformance)}</TableCell>
            <TableCell>{Math.round(data.summary.walletDeposit)}</TableCell>
            <TableCell>{Math.round(data.summary.usedTicketForDecount)}</TableCell>
            <TableCell>{Math.round(data.summary.thirdPartTicketForDecount)}</TableCell>
            <TableCell>{Math.round(data.summary.otherPayWayForDecount)}</TableCell>
            <TableCell>{Math.round(data.summary.walletUsedForDecount)}</TableCell>
            {bonusDisplay && <TableCell>{data.summary.bonusDecountForReport === null ? 0 : data.summary.bonusDecountForReport}</TableCell>}
            <TableCell>{Math.round(data.summary.businessCash)}</TableCell>
            <TableCell>{Math.round(data.summary.cashRevenue)}</TableCell>
            <TableCell>{Math.round(data.summary.cashExpenditure)}</TableCell>
            <TableCell>{Math.round(data.summary.expenditure)}</TableCell>
            <TableCell>{Math.round(data.summary.cashBalance)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
