import PropTypes from 'prop-types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { formatNumber } from 'ui/format'

function Results({
  performReference,
  merchantLeaderBoard,
  isSubmit,
  displayReportWithMembership,
  monthlyAverageDisplayForMerchantLeaderBoard,
  isIncludeMembershipPerformance
}) {
  // 查詢失敗時 merchantLeaderBoard 為 undefined：合計列以空清單計算（原本列表有防呆、合計列沒有，整頁錯誤）
  const list = (merchantLeaderBoard && merchantLeaderBoard.merchantLeaderBoard) || []
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
          {list.map((data, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <span>{index + 1}</span>
                  </TableCell>
                  <TableCell>{data.storeName}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.businessPerformanceTotal))}</TableCell>
                  {monthlyAverageDisplayForMerchantLeaderBoard && (
                    <TableCell numeric>{formatNumber(Math.round(data.monthlyAveragePerformance))}</TableCell>
                  )}
                  <TableCell numeric>{formatNumber(Math.round(data.serviceTotal))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.designateServiceTotal))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.nonDesignateServiceTotal))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.usedTicketTotal))}</TableCell>
                  <TableCell numeric>
                    {formatNumber(Math.round(
                      data.ticketSellIntoPerformanceDesignate +
                        data.ticketSellIntoPerformanceNonDesignate
                    ))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.productTotal))}</TableCell>
                  {displayReportWithMembership && <TableCell numeric>{formatNumber(Math.round(data.membershipTotal))}</TableCell>}
                  <TableCell numeric>
                    {formatNumber(Math.round(data.helperPaidPoint))}/{formatNumber(Math.round(data.helperPaidPrice))}
                  </TableCell>
                </TableRow>
              )
            })}
          <TableRow>
            <TableCell className="font-bold">合計</TableCell>
            <TableCell />
            <TableCell numeric>
              { formatNumber(Math.round(
                list
                  .map(data => data.businessPerformanceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            {monthlyAverageDisplayForMerchantLeaderBoard && (
              <TableCell numeric>
                {formatNumber(Math.round(
                  list
                    .map(data => data.monthlyAveragePerformance)
                    .reduce((acc, curVal) => acc + curVal, 0)
                ))}
              </TableCell>
            )}
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.serviceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.designateServiceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.nonDesignateServiceTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.usedTicketTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(
                    data =>
                      data.ticketSellIntoPerformanceDesignate +
                      data.ticketSellIntoPerformanceNonDesignate
                  )
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.productTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
            </TableCell>
            {displayReportWithMembership && <TableCell numeric>{formatNumber(Math.round(
                list
                  .map(data => data.membershipTotal)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}</TableCell>}
            <TableCell numeric>
              {formatNumber(Math.round(
                list
                  .map(data => data.helperPaidPoint)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
              /
              {formatNumber(Math.round(
                list
                  .map(data => data.helperPaidPrice)
                  .reduce((acc, curVal) => acc + curVal, 0)
              ))}
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
