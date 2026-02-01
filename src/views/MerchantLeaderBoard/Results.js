/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
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
}

function Results({
  performReference,
  merchantLeaderBoard,
  isSubmit,
  displayReportWithMembership,
  monthlyAverageDisplayForMerchantLeaderBoard,
  isIncludeMembershipPerformance
}) {
  return (
    isSubmit && (
      <TableContainer component={Paper} className='MerchantLeaderBoardTable'>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>名次</TableCell>
              <TableCell>所屬店家</TableCell>
              <TableCell>總業績</TableCell>
              {monthlyAverageDisplayForMerchantLeaderBoard && <TableCell>服務業績月平均</TableCell>}
              <TableCell>{`服務總業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
              <TableCell>{`服務業績(指)(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
              <TableCell>{`服務業績(不指)(${
                performReference === 'TRUTH' ? '實' : '虛'
              })`}</TableCell>
              <TableCell>{`卡券使用業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
              <TableCell>{`卡券販賣(入業績)(${
                performReference === 'TRUTH' ? '實' : '虛'
              })`}</TableCell>
              <TableCell>{`店販業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
              {displayReportWithMembership && <TableCell>{`會員卡業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>}
              <TableCell>互助使用(點數)/互助使用(金額)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="whiteSpace">
            {merchantLeaderBoard != undefined &&
              merchantLeaderBoard.merchantLeaderBoard.map((data, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="button">{index + 1}</Typography>
                    </TableCell>
                    <TableCell>{data.storeName}</TableCell>
                    <TableCell>{Math.round(data.businessPerformanceTotal)}</TableCell>
                    {monthlyAverageDisplayForMerchantLeaderBoard && (
                      <TableCell>{Math.round(data.monthlyAveragePerformance)}</TableCell>
                    )}
                    <TableCell>{Math.round(data.serviceTotal)}</TableCell>
                    <TableCell>{Math.round(data.designateServiceTotal)}</TableCell>
                    <TableCell>{Math.round(data.nonDesignateServiceTotal)}</TableCell>
                    <TableCell>{Math.round(data.usedTicketTotal)}</TableCell>
                    <TableCell>
                      {Math.round(
                        data.ticketSellIntoPerformanceDesignate +
                          data.ticketSellIntoPerformanceNonDesignate
                      )}
                    </TableCell>
                    <TableCell>{Math.round(data.productTotal)}</TableCell>
                    {displayReportWithMembership && <TableCell>{Math.round(data.membershipTotal)}</TableCell>}
                    <TableCell>
                      {Math.round(data.helperPaidPoint)}/{Math.round(data.helperPaidPrice)}
                    </TableCell>
                  </TableRow>
                )
              })}
            <TableRow>
              <TableCell css={styles.designerName}>合計</TableCell>
              <TableCell />
              <TableCell>
                { Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.businessPerformanceTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              {monthlyAverageDisplayForMerchantLeaderBoard && (
                <TableCell>
                  {Math.round(
                    merchantLeaderBoard.merchantLeaderBoard
                      .map(data => data.monthlyAveragePerformance)
                      .reduce((acc, curVal) => acc + curVal, 0)
                  )}
                </TableCell>
              )}
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.serviceTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.designateServiceTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.nonDesignateServiceTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.usedTicketTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(
                      data =>
                        data.ticketSellIntoPerformanceDesignate +
                        data.ticketSellIntoPerformanceNonDesignate
                    )
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.productTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
              {displayReportWithMembership && <TableCell>{Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.membershipTotal)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}</TableCell>}
              <TableCell>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.helperPaidPoint)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
                /
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.helperPaidPrice)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
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
