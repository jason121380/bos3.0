import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { cn } from 'ui/utils'

// 訂單日期欄固定在左側（與舊版 sticky 行為相同）
const sticky = 'sticky left-0 z-[99] whitespace-nowrap break-all'

export default function Results({ reportData, format, roundDecimal, handleCountTotal }) {
  return (
    <Fragment>
      {reportData.length > 0 ? (
        <Table dense className="[&_tbody_tr:last-child_td]:font-bold" aria-label="a dense table">
          <TableHeader className="sticky top-0 z-[100]">
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(sticky, 'bg-surface')}>帳單日期</TableHead>
              <TableHead>帳單編號</TableHead>
              <TableHead>設計師姓名</TableHead>
              <TableHead>顧客姓名</TableHead>
              <TableHead>會員卡名稱</TableHead>
              <TableHead numeric>實際售價</TableHead>
              <TableHead numeric>數量</TableHead>
              <TableHead numeric>小計</TableHead>
              <TableHead numeric>手續費</TableHead>
              <TableHead numeric>販賣業績(實)</TableHead>
              <TableHead numeric>抽成</TableHead>
              <TableHead>備註</TableHead>
              <TableHead>到期日</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((d, i) => (
              <TableRow key={`MembershipSellReport-${i}`} className="group">
                <TableCell className={cn(sticky, 'bg-background tabular-nums group-hover:bg-surface-hover')}>
                  {format(d.orderDate, 'yyyy/MM/dd')}
                </TableCell>
                <TableCell className="tabular-nums">
                  <Link className="text-text underline" target="_blank" to={`/order/${d.orderId}`}>{`#${d.orderNo}`}</Link>
                </TableCell>
                <TableCell>{d.designerName}</TableCell>
                <TableCell>{d.customerName}</TableCell>
                <TableCell>{d.membershipName}</TableCell>
                <TableCell numeric>{formatNumber(d.sellPrice)}</TableCell>
                <TableCell numeric>{formatNumber(d.count)}</TableCell>
                <TableCell numeric>{formatNumber(d.summary)}</TableCell>
                <TableCell numeric>{formatNumber(roundDecimal(d.handlingFee))}</TableCell>
                <TableCell numeric>{formatNumber(roundDecimal(d.truth))}</TableCell>
                <TableCell numeric>{formatNumber(roundDecimal(d.rake))}</TableCell>
                <TableCell>{d.remark}</TableCell>
                <TableCell className="tabular-nums">{d.expiryDate ? format(d.expiryDate, 'yyyy/MM/dd') : '永久會籍'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="group">
              <TableCell className={cn(sticky, 'bg-background group-hover:bg-surface-hover')} />
              <TableCell colSpan={3} />
              <TableCell>合計</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('sellPrice'))}</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('count'))}</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('summary'))}</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('handlingFee'))}</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('truth'))}</TableCell>
              <TableCell numeric>{formatNumber(handleCountTotal('rake'))}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <Card>
          <EmptyState title="無資料" />
        </Card>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
  roundDecimal: PropTypes.func,
  handleCountTotal: PropTypes.func,
}
