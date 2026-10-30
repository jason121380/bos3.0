import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'
import roundDecimal from './../../helper/roundDecimal.js'
import { formatNumber } from 'ui/format'

function Results({ data, isServiceTicketMerged, isMemberShipCardActive, bonusDisplay }) {
  return (
    <Table dense wrapperClassName="BusinessAnalysisReportTable" className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="sticky top-0 z-[100] bg-background [outline:1px_solid_rgb(var(--border))]">
          <TableHead className="sticky left-0 z-[99] bg-background [outline:1px_solid_rgb(var(--border))]">營業日期</TableHead>
          {isServiceTicketMerged ? (
            <Fragment>
              <TableHead>營業總業績</TableHead>
              <TableHead>店販消費</TableHead>
              {isMemberShipCardActive && <TableHead>會員卡消費</TableHead>}
            </Fragment>
          ) : (
            <Fragment>
              <TableHead>服務消費</TableHead>
              <TableHead>店販消費</TableHead>
              {isMemberShipCardActive && <TableHead>會員卡消費</TableHead>}
              <TableHead>卡券使用(入業績)</TableHead>
              <TableHead>卡券販賣(入業績)</TableHead>
            </Fragment>
          )}

          <TableHead>業績收入</TableHead>
          <TableHead>卡券販賣(不入業績)</TableHead>
          <TableHead>入金儲值(不入業績)</TableHead>
          <TableHead>卡券使用(-)</TableHead>
          <TableHead>第三方卡券(-)</TableHead>
          <TableHead>其他付款方式(-)</TableHead>
          <TableHead>入金使用(-)</TableHead>
          {bonusDisplay && <TableHead>點數折抵金額(-)</TableHead>}
          <TableHead>營業現金應收</TableHead>
          <TableHead>現金收支收入</TableHead>
          <TableHead>現金收支支出(-)</TableHead>
          <TableHead>員工借支</TableHead>
          <TableHead>現金結存</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.data.map(row => (
          <TableRow key={row.date}>
            <TableCell className="sticky left-0 z-[99] bg-background [outline:1px_solid_rgb(var(--border))]">
              {format(row.date, 'yyyy/MM/dd')}
            </TableCell>
            {isServiceTicketMerged ? (
              <Fragment>
                <TableCell>{formatNumber(Math.round(row.service + row.usedTicket + row.ticketSellIntoPerformance))}</TableCell>
                <TableCell>{formatNumber(Math.round(row.product))}</TableCell>
                {isMemberShipCardActive && <TableCell>{formatNumber(Math.round(row.membership))}</TableCell>}
              </Fragment>
            ) : (
              <Fragment>
                <TableCell>{formatNumber(Math.round(row.service))}</TableCell>
                <TableCell>{formatNumber(Math.round(row.product))}</TableCell>
                {isMemberShipCardActive && <TableCell>{formatNumber(Math.round(row.membership))}</TableCell>}
                <TableCell>{formatNumber(roundDecimal(row.usedTicket))}</TableCell>
                <TableCell>{formatNumber(Math.round(row.ticketSellIntoPerformance))}</TableCell>
              </Fragment>
            )}

            <TableCell>{formatNumber(Math.round(row.performanceIncome))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.ticketSellNotIntoPerformance))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.walletDeposit))}</TableCell>
            <TableCell>{formatNumber(roundDecimal(row.usedTicketForDecount))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.thirdPartTicketForDecount))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.otherPayWayForDecount))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.walletUsedForDecount))}</TableCell>
            {bonusDisplay && <TableCell>{formatNumber(row.bonusDecountForReport)}</TableCell>}
            <TableCell>{formatNumber(Math.round(row.businessCash))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.cashRevenue))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.cashExpenditure))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.expenditure))}</TableCell>
            <TableCell>{formatNumber(Math.round(row.cashBalance))}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="sticky left-0 z-[99] bg-background [outline:1px_solid_rgb(var(--border))]">
            <b>合計</b>
          </TableCell>
          {isServiceTicketMerged ? (
            <Fragment>
              <TableCell>
                {formatNumber(Math.round(data.summary.service + data.summary.usedTicket + data.summary.ticketSellIntoPerformance))}
              </TableCell>
              <TableCell>{formatNumber(Math.round(data.summary.product))}</TableCell>
              {isMemberShipCardActive && <TableCell>{formatNumber(Math.round(data.summary.membership))}</TableCell>}
            </Fragment>
          ) : (
            <Fragment>
              <TableCell>{formatNumber(Math.round(data.summary.service))}</TableCell>
              <TableCell>{formatNumber(Math.round(data.summary.product))}</TableCell>
              {isMemberShipCardActive && <TableCell>{formatNumber(Math.round(data.summary.membership))}</TableCell>}
              <TableCell>{formatNumber(Math.round(data.summary.usedTicket))}</TableCell>
              <TableCell>{formatNumber(Math.round(data.summary.ticketSellIntoPerformance))}</TableCell>
            </Fragment>
          )}
          <TableCell>{formatNumber(Math.round(data.summary.performanceIncome))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.ticketSellNotIntoPerformance))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.walletDeposit))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.usedTicketForDecount))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.thirdPartTicketForDecount))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.otherPayWayForDecount))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.walletUsedForDecount))}</TableCell>
          {bonusDisplay && (
            <TableCell>{formatNumber(data.summary.bonusDecountForReport === null ? 0 : data.summary.bonusDecountForReport)}</TableCell>
          )}
          <TableCell>{formatNumber(Math.round(data.summary.businessCash))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.cashRevenue))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.cashExpenditure))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.expenditure))}</TableCell>
          <TableCell>{formatNumber(Math.round(data.summary.cashBalance))}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
