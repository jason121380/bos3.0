import idx from 'idx'
import { Fragment } from 'react'
import { format } from 'date-fns'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

export default function Results({ data, total, bonusDisplay }) {
  const getData = idx(data, _ => _.nonCashDetailStatement)
  return (
    <Fragment>
      {getData != undefined && (
        <Table dense aria-label="a dense table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>帳單日期 </TableHead>
              <TableHead>序號 </TableHead>
              <TableHead>帳單編號 </TableHead>
              <TableHead>客戶姓名</TableHead>
              <TableHead>設計師代號 </TableHead>
              <TableHead>設計師姓名 </TableHead>

              {getData.otherPayUsing.map((item, index) => {
                return (
                  <TableHead key={index} className="min-w-[140px]">
                    <span className="flex justify-center">{item}</span>
                    <span className="flex justify-around">
                      <span>金額  </span>
                      <span>手續費</span>
                    </span>
                  </TableHead>
                )
              })}

              {getData.thirdPartTicketUsing.map((item, index) => {
                return (
                  <TableHead key={index} className="min-w-[140px]">
                    <span className="flex justify-center">{item}</span>
                    <span className="flex justify-around">
                        <span>金額   </span>
                        <span>手續費</span>
                    </span>
                  </TableHead>
                )
              })}

              <TableHead numeric>入金使用金額</TableHead>
              {bonusDisplay && <TableHead numeric>點數折抵金額</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {getData != undefined &&
              getData.nonCashDetailStatement.map((item, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap tabular-nums">{format(item.date, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>{item.serialNumber}</TableCell>
                    <TableCell>{item.orderNo}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>{item.designerNo}</TableCell>
                    <TableCell>{item.designerName}</TableCell>
                    {item.otherPay.map((i, otherPayIndex) => {
                      return (
                        <TableCell key={otherPayIndex}>
                          <span className="flex justify-around tabular-nums">
                            <span>{formatNumber(i.price)}</span>
                            <span>{formatNumber(Math.round(i.handlingFee))}</span>
                          </span>
                        </TableCell>
                      )
                    })}
                    {item.thirdPartTicket.map((i, thirdPartTicketIndex) => {
                      return (
                        <TableCell key={thirdPartTicketIndex}>
                          <span className="flex justify-around tabular-nums">
                            <span>{formatNumber(i.price)}</span>
                            <span>{formatNumber(Math.round(i.handlingFee))}</span>
                          </span>
                        </TableCell>
                      )
                    })}
                    <TableCell numeric>{formatNumber(item.walletUsed)}</TableCell>
                    {bonusDisplay && <TableCell numeric>{formatNumber(item.bonusDecount)}</TableCell>}
                  </TableRow>
                )
              })}
          </TableBody>
          <TableBody className="bg-surface font-medium">
            {total != undefined && (
              <TableRow>
                <TableCell colSpan={6}>
                  <b>合計</b>
                </TableCell>

                {total.otherPay.map((i, totalOtherPayIndex)=> {
                  return (
                    <TableCell key={totalOtherPayIndex}>
                      <span className="flex justify-around tabular-nums">
                        <span>{formatNumber(i.price)}</span>
                        <span>{formatNumber(Math.round(i.handlingFee))}</span>
                      </span>
                    </TableCell>
                  )
                })}
                {total.thirdParty.map((i, totalThirdPartyIndex)=> {
                  return (
                    <TableCell key={totalThirdPartyIndex}>
                      <span className="flex justify-around tabular-nums">
                        <span>{formatNumber(i.price)}</span>
                        <span>{formatNumber(Math.round(i.handlingFee))}</span>
                      </span>
                    </TableCell>
                  )
                })}
                <TableCell numeric className="font-medium">{formatNumber(getData.summary.walletUsed)}</TableCell>
                {bonusDisplay && <TableCell numeric className="font-medium">{formatNumber(getData.summary.bonusDecount)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Fragment>
  )
}

Results.defaultProps = {}
