import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { format } from 'date-fns'

function Results({ reportData }) {
  const recordType = type => {
    switch (type) {
      case 'SALE':
        return '店販'
      case 'PURCHASE':
        return '進貨'
      case 'PICKING':
        return '自購'
      default:
        // 其他值不處理（與原本沒有 default 時相同）
        break
    }
  }

  return (
    <Table
      dense
      className="min-w-[650px]"
      wrapperClassName="ProductInvoicingRecordReportTable mt-3 max-h-[calc(100vh-340px)] overflow-y-auto"
      aria-label="a dense table"
    >
      <TableHeader>
        <TableRow className="sticky top-0 z-[100] [background:white] [outline:1px_solid_rgb(var(--border))]">
          <TableHead className="sticky left-0 z-[99] w-[100px] [background:white] [outline:1px_solid_rgb(var(--border))]">時間</TableHead>
          <TableHead>編號</TableHead>
          <TableHead>商品名稱</TableHead>
          <TableHead>商品代號</TableHead>
          <TableHead>商品單位</TableHead>
          <TableHead>類型</TableHead>
          <TableHead>數量</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reportData.map((d, index) => (
          <TableRow key={`reportDataRow-${index}`}>
            <TableCell className="sticky left-0 z-[99] w-[100px] [background:white] [outline:1px_solid_rgb(var(--border))]">
              {format(d.date, 'yyyy/MM/dd')}
            </TableCell>
            <TableCell style={{ wordBreak: 'break-all' }}>{d.no}</TableCell>
            <TableCell>{d.productName}</TableCell>
            <TableCell>{d.productNo}</TableCell>
            <TableCell>{d.unit}</TableCell>
            <TableCell>{recordType(d.type)}</TableCell>
            <TableCell>{d.count}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell></TableCell>
          <TableCell colSpan={4}></TableCell>
          <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
          <TableCell style={{ fontWeight: 'bold' }}>{reportData.reduce((a, b) => a + b.count, 0)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
}

Results.defaultProps = {
  reportData: [],
}

export default Results
