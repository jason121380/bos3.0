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
import idx from 'idx'
import { Fragment } from 'react'
import { format } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  sepreateDiv: css({
    display: 'flex',
    justifyContent: 'space-around',
  }),
  centerTd: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  centerWalletUsed: css({
    textAlign: 'center',
  })
}

export default function Results({ data, total, bonusDisplay }) {
  const getData = idx(data, _ => _.nonCashDetailStatement)
  return (
    <Fragment>
      {getData != undefined && (
        <TableContainer component={Paper}>
          <Table css={styles.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>帳單日期 </TableCell>
                <TableCell>序號 </TableCell>
                <TableCell>帳單編號 </TableCell>
                <TableCell>客戶姓名</TableCell>
                <TableCell>設計師代號 </TableCell>
                <TableCell>設計師姓名 </TableCell>

                {getData.otherPayUsing.map((item, index) => {
                  return (
                    <TableCell key={index}>
                      <span css={styles.centerTd}>{item}</span>
                      <span css={styles.sepreateDiv}>
                        <span>金額  </span>
                        <span>手續費</span>
                      </span>
                    </TableCell>
                  )
                })}

                {getData.thirdPartTicketUsing.map((item, index) => {
                  return (
                    <TableCell key={index}>
                      <span css={styles.centerTd}>{item}</span>
                      <span css={styles.sepreateDiv} >
                          <span>金額   </span>
                          <span>手續費</span>
                      </span>
                    </TableCell>
                  )
                })}

                <TableCell>入金使用金額</TableCell>
                {bonusDisplay && <TableCell>點數折抵金額</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {getData != undefined &&
                getData.nonCashDetailStatement.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{format(item.date, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{item.serialNumber}</TableCell>
                      <TableCell>{item.orderNo}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.designerNo}</TableCell>
                      <TableCell>{item.designerName}</TableCell>
                      {item.otherPay.map((i, otherPayIndex) => {
                        return (
                          <TableCell key={otherPayIndex}>
                            <span css={styles.sepreateDiv}>
                              <span>{i.price}</span>
                              <span>{Math.round(i.handlingFee)}</span>
                            </span>
                          </TableCell>
                        )
                      })}
                      {item.thirdPartTicket.map((i, thirdPartTicketIndex) => {
                        return (
                          <TableCell key={thirdPartTicketIndex}>
                            <span css={styles.sepreateDiv}>
                              <span>{i.price}</span>
                              <span>{Math.round(i.handlingFee)}</span>
                            </span>
                          </TableCell>
                        )
                      })}
                      <TableCell css={styles.centerWalletUsed}>{item.walletUsed}</TableCell>
                      {bonusDisplay && <TableCell css={styles.centerWalletUsed}>{item.bonusDecount}</TableCell>}
                    </TableRow>
                  )
                })}
            </TableBody>
            <TableBody>
              {total != undefined && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <b>合計</b>
                  </TableCell>

                  {total.otherPay.map((i, totalOtherPayIndex)=> {
                    return (
                      <TableCell key={totalOtherPayIndex}>
                        <span css={styles.sepreateDiv}>
                          <span>{i.price}</span>
                          <span>{Math.round(i.handlingFee)}</span>
                        </span>
                      </TableCell>
                    )
                  })}
                  {total.thirdParty.map((i, totalThirdPartyIndex)=> {
                    return (
                      <TableCell key={totalThirdPartyIndex}>
                        <span css={styles.sepreateDiv}>
                          <span>{i.price}</span>
                          <span>{Math.round(i.handlingFee)}</span>
                        </span>
                      </TableCell>
                    )
                  })}
                  <TableCell css={styles.centerWalletUsed}>{getData.summary.walletUsed}</TableCell>
                  {bonusDisplay && <TableCell css={styles.centerWalletUsed}>{getData.summary.bonusDecount}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Fragment>
  )
}

Results.defaultProps = {}
