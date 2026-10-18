/** @jsxImportSource @emotion/react */
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

const styles = {
  table: ({
    minWidth: 650,
  }),
  designerName: {
    fontWeight: 'bold',
  },
}

function Results({
  helperMonthlyReport,
  membershipDisplay,
}) {
  return (
    // HelperMonthlyReport：@media print 樣式掛鉤（以 table／th／td 標籤選取），保留在表格外框
    <Table wrapperClassName='HelperMonthlyReport mt-2' className="min-w-[650px]" aria-label="a dense table">
      {/* 列印時表頭白底黑字，與舊版 th.MuiTableCell-head 的列印樣式一致 */}
      <TableHeader className="print:bg-transparent print:[&_th]:text-text">
        <TableRow className="hover:bg-transparent">
          <TableHead>設計師</TableHead>
          <TableHead numeric>互助獲得 (不含點)</TableHead>
          <TableHead numeric>互助獲得 (點)</TableHead>
          <TableHead numeric>店販業績</TableHead>
          <TableHead numeric>店販抽成</TableHead>
          {membershipDisplay && (
            <Fragment>
              <TableHead numeric>會員卡業績</TableHead>
              <TableHead numeric>會員卡抽成</TableHead>
            </Fragment>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
          {helperMonthlyReport.map((data, index) => {
            return (
            <TableRow key={index}>
              <TableCell>{data.designer}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(data.helperRetrievePriceWithoutPoint))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(data.helperRetrievePoint))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(data.productPerformance))}</TableCell>
              <TableCell numeric>{formatNumber(Math.round(data.productRake * 10) / 10)}</TableCell>
              {membershipDisplay && (
                <Fragment>
                  <TableCell numeric>{formatNumber(Math.round(data.membershipPerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(data.membershipRake * 10) / 10)}</TableCell>
                </Fragment>
              )}
            </TableRow>
            )
          })}
        <TableRow className="bg-surface font-medium">
          <TableCell className="font-bold">合計</TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.helperRetrievePriceWithoutPoint, 0)))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.helperRetrievePoint, 0)))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.productPerformance, 0)))}
            </TableCell>
            <TableCell numeric>
              {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.productRake, 0) * 10) / 10)}
            </TableCell>
            {membershipDisplay && (
              <Fragment>
                <TableCell numeric>
                  {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipPerformance, 0)))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipRake, 0) * 10) / 10)}
                </TableCell>
              </Fragment> 
            )}
        </TableRow>
      </TableBody>
    </Table>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
