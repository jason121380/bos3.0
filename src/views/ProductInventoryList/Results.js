/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
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
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
  }),
  noData: css({
    fontSize: 24,
    textAlign: 'center'
  })
}

function Results({ reportData }) {
  return (
    <>
      {
        reportData.length === 0 ? <p css={styles.noData}>無資料</p> :
          <TableContainer style={{ maxHeight: 'calc(100vh - 260px)' }} className='ProductInventoryListTable' component={Paper}>
            <Table css={styles.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow css={styles.stickyRow}>
                  <TableCell>代號</TableCell>
                  <TableCell>名稱</TableCell>
                  <TableCell>數量</TableCell>
                  <TableCell>類別</TableCell>
                  <TableCell>廠商</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((d, index) => (
                  <TableRow hover key={`${d.productNo}-${d.name}-${index}`}>
                    <TableCell>{d.productNo || <small>{`(無代號)`}</small>}</TableCell>
                    <TableCell>{d.productName}</TableCell>
                    <TableCell>{d.count}</TableCell>
                    <TableCell>{d.productCategory}</TableCell>
                    <TableCell>{d.vendorName || <small>{`(無廠商)`}</small>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      }
    </>
  )
}

Results.propTypes = {
  reportData: PropTypes.array,
}

Results.defaultProps = {
  reportData: [],
}

export default Results