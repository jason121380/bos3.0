import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'

export default function Results({ productConsumeListReport, value }) {
  return (
    <Fragment>
      <Table aria-label="a dense table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>領料日期</TableHead>
              <TableHead>員工編號</TableHead>
              <TableHead>員工姓名</TableHead>
              <TableHead>商品編號</TableHead>
              <TableHead>商品名稱</TableHead>
              <TableHead numeric>數量</TableHead>
              <TableHead>單位</TableHead>
              <TableHead numeric>成本</TableHead>
              <TableHead numeric>單價</TableHead>
              <TableHead numeric>小計</TableHead>
              <TableHead>用途</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value !== ''
              ? productConsumeListReport.productConsumeRecord
                  .filter(d => d.purpose === value)
                  .map((data, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="tabular-nums">{format(data.date, 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{data.designerNo}</TableCell>
                        <TableCell>{data.designerName}</TableCell>
                        <TableCell>{data.productNo}</TableCell>
                        <TableCell>{data.productName}</TableCell>
                        <TableCell numeric>{formatNumber(data.count)}</TableCell>
                        <TableCell>{data.unit}</TableCell>
                        <TableCell numeric>{formatNumber(data.unitCost)}</TableCell>
                        <TableCell numeric>{formatNumber(data.unitPrice)}</TableCell>
                        <TableCell numeric>{formatNumber(data.subTotal)}</TableCell>
                        <TableCell>{data.purpose}</TableCell>
                      </TableRow>
                    )
                  })
              : productConsumeListReport.productConsumeRecord.map((data, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="tabular-nums">{format(data.date, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.designerName}</TableCell>
                      <TableCell>{data.productNo}</TableCell>
                      <TableCell>{data.productName}</TableCell>
                      <TableCell numeric>{formatNumber(data.count)}</TableCell>
                      <TableCell>{data.unit}</TableCell>
                      <TableCell numeric>{formatNumber(data.unitCost)}</TableCell>
                      <TableCell numeric>{formatNumber(data.unitPrice)}</TableCell>
                      <TableCell numeric>{formatNumber(data.subTotal)}</TableCell>
                      <TableCell>{data.purpose}</TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
      </Table>
      <Table wrapperClassName="mt-6" aria-label="a dense table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead></TableHead>
              <TableHead numeric>成本</TableHead>
              <TableHead numeric>金額</TableHead>
              <TableHead numeric>數量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value != ''
              ? productConsumeListReport.productConsumeSummary
                  .filter(d => d.purpose === value)
                  .map((data, index) => (
                    <TableRow key={index}>
                      <TableCell style={data.purpose === '合計' ? { fontWeight: 'bold' } : {}}>
                        {data.purpose}
                      </TableCell>
                      <TableCell numeric>{formatNumber(data.cost)}</TableCell>
                      <TableCell numeric>{formatNumber(data.price)}</TableCell>
                      <TableCell numeric>{formatNumber(data.count)}</TableCell>
                    </TableRow>
                  ))
              : productConsumeListReport.productConsumeSummary.map((data, index) => (
                  <TableRow key={index}> 
                    <TableCell style={data.purpose === '合計' ? { fontWeight: 'bold' } : {}}>
                      {data.purpose}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.cost)}</TableCell>
                    <TableCell numeric>{formatNumber(data.price)}</TableCell>
                    <TableCell numeric>{formatNumber(data.count)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
      </Table>
    </Fragment>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
