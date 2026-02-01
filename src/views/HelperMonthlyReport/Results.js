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
import { Fragment } from 'react'

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
    <TableContainer style={{ marginTop: 8 }} component={Paper} className='HelperMonthlyReport'>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>設計師</TableCell>
            <TableCell>互助獲得 (不含點)</TableCell>
            <TableCell>互助獲得 (點)</TableCell>
            <TableCell>店販業績</TableCell>
            <TableCell>店販抽成</TableCell>
            {membershipDisplay && (
              <Fragment>
                <TableCell>會員卡業績</TableCell>
                <TableCell>會員卡抽成</TableCell>
              </Fragment>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
            {helperMonthlyReport.map((data, index) => {
              return (
              <TableRow key={index}>
                <TableCell>{data.designer}</TableCell>
                <TableCell>{Math.round(data.helperRetrievePriceWithoutPoint)}</TableCell>
                <TableCell>{Math.round(data.helperRetrievePoint)}</TableCell>
                <TableCell>{Math.round(data.productPerformance)}</TableCell>
                <TableCell>{Math.round(data.productRake * 10) / 10}</TableCell>
                {membershipDisplay && (
                  <Fragment>
                    <TableCell>{Math.round(data.membershipPerformance)}</TableCell>
                    <TableCell>{Math.round(data.membershipRake * 10) / 10}</TableCell>
                  </Fragment>
                )}
              </TableRow>
              )
            })}
          <TableRow>
            <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
              <TableCell>
                {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.helperRetrievePriceWithoutPoint, 0))}
              </TableCell>
              <TableCell>
                {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.helperRetrievePoint, 0))}
              </TableCell>
              <TableCell>
                {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.productPerformance, 0))}
              </TableCell>
              <TableCell>
                {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.productRake, 0) * 10) / 10}
              </TableCell>
              {membershipDisplay && (
                <Fragment>
                  <TableCell>
                    {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipPerformance, 0))}
                  </TableCell>
                  <TableCell>
                    {Math.round(helperMonthlyReport.reduce((accu, curVal) => accu + curVal.membershipRake, 0) * 10) / 10}
                  </TableCell>
                </Fragment> 
              )}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
