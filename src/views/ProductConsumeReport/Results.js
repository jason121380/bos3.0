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
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { format } from 'date-fns'

export default function Results({ productConsumeListReport, value }) {
  return (
    <Fragment>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>領料日期</TableCell>
              <TableCell>員工編號</TableCell>
              <TableCell>員工姓名</TableCell>
              <TableCell>商品編號</TableCell>
              <TableCell>商品名稱</TableCell>
              <TableCell>數量</TableCell>
              <TableCell>單位</TableCell>
              <TableCell>成本</TableCell>
              <TableCell>單價</TableCell>
              <TableCell>小計</TableCell>
              <TableCell>用途</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {value !== ''
              ? productConsumeListReport.productConsumeRecord
                  .filter(d => d.purpose === value)
                  .map((data, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{data.designerNo}</TableCell>
                        <TableCell>{data.designerName}</TableCell>
                        <TableCell>{data.productNo}</TableCell>
                        <TableCell>{data.productName}</TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell>{data.unit}</TableCell>
                        <TableCell>{data.unitCost}</TableCell>
                        <TableCell>{data.unitPrice}</TableCell>
                        <TableCell>{data.subTotal}</TableCell>
                        <TableCell>{data.purpose}</TableCell>
                      </TableRow>
                    )
                  })
              : productConsumeListReport.productConsumeRecord.map((data, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{format(data.date, 'yyyy/MM/dd')}</TableCell>
                      <TableCell>{data.designerNo}</TableCell>
                      <TableCell>{data.designerName}</TableCell>
                      <TableCell>{data.productNo}</TableCell>
                      <TableCell>{data.productName}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{data.unit}</TableCell>
                      <TableCell>{data.unitCost}</TableCell>
                      <TableCell>{data.unitPrice}</TableCell>
                      <TableCell>{data.subTotal}</TableCell>
                      <TableCell>{data.purpose}</TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>成本</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>數量</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {value != ''
              ? productConsumeListReport.productConsumeSummary
                  .filter(d => d.purpose === value)
                  .map((data, index) => (
                    <TableRow key={index}>
                      <TableCell style={data.purpose === '合計' ? { fontWeight: 'bold' } : {}}>
                        {data.purpose}
                      </TableCell>
                      <TableCell>{data.cost}</TableCell>
                      <TableCell>{data.price}</TableCell>
                      <TableCell>{data.count}</TableCell>
                    </TableRow>
                  ))
              : productConsumeListReport.productConsumeSummary.map((data, index) => (
                  <TableRow key={index}> 
                    <TableCell style={data.purpose === '合計' ? { fontWeight: 'bold' } : {}}>
                      {data.purpose}
                    </TableCell>
                    <TableCell>{data.cost}</TableCell>
                    <TableCell>{data.price}</TableCell>
                    <TableCell>{data.count}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  )
}

Results.propTypes = {
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}
