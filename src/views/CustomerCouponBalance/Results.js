import PropTypes from 'prop-types'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function Results({ report, total, countTotalPrice }) {
  return (
    <Table className="min-w-[650px]" aria-label="a dense table">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>顧客編號</TableHead>
          <TableHead>顧客姓名</TableHead>
          <TableHead>顧客手機</TableHead>
          <TableHead>卡券編號</TableHead>
          <TableHead>卡券名稱</TableHead>
          <TableHead numeric>總金額</TableHead>
          <TableHead numeric>總量</TableHead>
          <TableHead numeric>已使用數量</TableHead>
          <TableHead numeric>剩餘數量</TableHead>
          <TableHead numeric>剩餘金額</TableHead>
          <TableHead numeric>單張卡券原始金額</TableHead>
          <TableHead numeric>單張卡券扣手續費後金額</TableHead>
          <TableHead numeric>單張卡券之手續費</TableHead>
          <TableHead>其他付款方式名稱</TableHead>
          <TableHead>是否已先入業績</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {report != null &&
          report.map((data, i) =>
            data.data.map((d, index) => {
              return (
                // 同一位顧客的卡券以底色分組（原 styles.dark／light）
                <TableRow key={index} className={i % 2 === 0 ? 'bg-surface' : 'bg-background'}>
                  <TableCell>{d.customerNo}</TableCell>
                  <TableCell>{d.customerName}</TableCell>
                  <TableCell className="tabular-nums">{d.customerCellPhone}</TableCell>
                  <TableCell>{d.couponNo}</TableCell>
                  <TableCell>{d.couponName}</TableCell>
                  <TableCell numeric>{formatNumber(d.totalCount * Math.round(d.singleCouponPrice))}</TableCell>
                  <TableCell numeric>{formatNumber(d.totalCount)}</TableCell>
                  <TableCell numeric>{formatNumber(d.usedCount)}</TableCell>
                  <TableCell numeric>{formatNumber(d.remainingCount)}</TableCell>
                  <TableCell numeric>{formatNumber(d.remainingCount * Math.round(d.singleCouponPrice))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(d.singleCouponPrice))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(d.singleCouponPriceDecreaseHandingFee))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.abs(Math.round(d.singleCouponHandingFee)))}</TableCell>
                  <TableCell>{d.otherPaymentName !== null ? d.otherPaymentName : '無'}</TableCell>
                  <TableCell>{d.isIntoPerformanceWhileBuying === true ? '是' : '否'}</TableCell>
                </TableRow>
              )
            })
          )}

        <TableRow className="font-medium">
          <TableCell className="font-bold">合計</TableCell>
          <TableCell colSpan={4} />
          <TableCell numeric>{formatNumber(countTotalPrice(total, 'totalCount'))}</TableCell>
          <TableCell numeric>
            {total != null && total.reduce((acc, curVal) => acc + curVal.totalCount, 0)}
          </TableCell>
          <TableCell numeric>
            {total != null && total.reduce((acc, curVal) => acc + curVal.usedCount, 0)}
          </TableCell>
          <TableCell numeric>
            {total != null && total.reduce((acc, curVal) => acc + curVal.remainingCount, 0)}
          </TableCell>
          <TableCell numeric>{formatNumber(countTotalPrice(total, 'remainingCount'))}</TableCell>
          <TableCell numeric>
            {total != null && Math.round(total.reduce((acc, curVal) => acc + curVal.singleCouponPrice, 0))}
          </TableCell>
          <TableCell numeric>
            {total != null &&
              Math.round(total.reduce((acc, curVal) => acc + curVal.singleCouponPriceDecreaseHandingFee, 0))}
          </TableCell>
          <TableCell numeric>
            {total != null &&
              Math.abs(
                Math.round(
                  total.reduce((acc, curVal) => acc + curVal.singleCouponHandingFee, 0)
                )
              )}
          </TableCell>
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
