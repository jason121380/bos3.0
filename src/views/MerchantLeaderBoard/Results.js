import PropTypes from 'prop-types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

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
      <Table dense wrapperClassName="MerchantLeaderBoardTable" className="min-w-[650px]" aria-label="a dense table">
        <TableHeader>
          <TableRow>
            <TableHead>名次</TableHead>
            <TableHead>所屬店家</TableHead>
            <TableHead numeric>總業績</TableHead>
            {monthlyAverageDisplayForMerchantLeaderBoard && <TableHead numeric>服務業績月平均</TableHead>}
            <TableHead numeric>{`服務總業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
            <TableHead numeric>{`服務業績(指)(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
            <TableHead numeric>{`服務業績(不指)(${
              performReference === 'TRUTH' ? '實' : '虛'
            })`}</TableHead>
            <TableHead numeric>{`卡券使用業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
            <TableHead numeric>{`卡券販賣(入業績)(${
              performReference === 'TRUTH' ? '實' : '虛'
            })`}</TableHead>
            <TableHead numeric>{`店販業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>
            {displayReportWithMembership && <TableHead numeric>{`會員卡業績(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableHead>}
            <TableHead numeric>互助使用(點數)/互助使用(金額)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody id="whiteSpace">
          {merchantLeaderBoard != undefined &&
            merchantLeaderBoard.merchantLeaderBoard.map((data, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <span>{index + 1}</span>
                  </TableCell>
                  <TableCell>{data.storeName}</TableCell>
                  <TableCell numeric>{Math.round(data.businessPerformanceTotal)}</TableCell>
                  {monthlyAverageDisplayForMerchantLeaderBoard && (
                    <TableCell numeric>{Math.round(data.monthlyAveragePerformance)}</TableCell>
                  )}
                  <TableCell numeric>{Math.round(data.serviceTotal)}</TableCell>
                  <TableCell numeric>{Math.round(data.designateServiceTotal)}</TableCell>
                  <TableCell numeric>{Math.round(data.nonDesignateServiceTotal)}</TableCell>
                  <TableCell numeric>{Math.round(data.usedTicketTotal)}</TableCell>
                  <TableCell numeric>
                    {Math.round(
                      data.ticketSellIntoPerformanceDesignate +
                        data.ticketSellIntoPerformanceNonDesignate
                    )}
                  </TableCell>
                  <TableCell numeric>{Math.round(data.productTotal)}</TableCell>
                  {displayReportWithMembership && <TableCell numeric>{Math.round(data.membershipTotal)}</TableCell>}
                  <TableCell numeric>
                    {Math.round(data.helperPaidPoint)}/{Math.round(data.helperPaidPrice)}
                  </TableCell>
                </TableRow>
              )
            })}
          <TableRow>
            <TableCell className="font-bold">合計</TableCell>
            <TableCell />
            <TableCell numeric>
              { Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.businessPerformanceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            {monthlyAverageDisplayForMerchantLeaderBoard && (
              <TableCell numeric>
                {Math.round(
                  merchantLeaderBoard.merchantLeaderBoard
                    .map(data => data.monthlyAveragePerformance)
                    .reduce((acc, curVal) => acc + curVal, 0)
                )}
              </TableCell>
            )}
            <TableCell numeric>
              {Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.serviceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            <TableCell numeric>
              {Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.designateServiceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            <TableCell numeric>
              {Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.nonDesignateServiceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            <TableCell numeric>
              {Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.usedTicketTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            <TableCell numeric>
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
            <TableCell numeric>
              {Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.productTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}
            </TableCell>
            {displayReportWithMembership && <TableCell numeric>{Math.round(
                merchantLeaderBoard.merchantLeaderBoard
                  .map(data => data.membershipTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              )}</TableCell>}
            <TableCell numeric>
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
