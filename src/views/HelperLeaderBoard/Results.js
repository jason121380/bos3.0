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
  IconButton,
  Collapse,
  Box
} from '@mui/material'
import { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import roundDecimal from './../../helper/roundDecimal.js'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { css } from '@emotion/react'

const TABLE_COLUMNS = {
  EXPAND: '展開',
  RANK: '名次',
  DESIGNER: '設計師',
  STORE: '所屬店家',
  HELPER_POINTS: '互助獲得(點數)',
  HELPER_PRICE: '互助獲得(金額)',
  PRODUCT_TOTAL: '店販業績',
  MEMBERSHIP_TOTAL: '會員卡業績'
}

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
  collapseCell: (isOpen) => css({
    padding: 0,
    borderBottom: isOpen ? undefined : 'none',
  }),
}

function Results({ report, performReference, displayReportWithMembership }) {
  const [open, setOpen] = useState([])
  const hasMergedDetailsRows = report.some(data => data.mergedDetails?.length > 1)

  const handleClick = (index) => () => {
    const idx = open.indexOf(index)
    if (idx > -1) {
      const arr = open
      arr.splice(idx, 1)
      setOpen([...arr])
    } else {
      setOpen([...open, index])
    }
  }
  const isOpen = (index) => open.includes(index)
  const getHasMergedDetails = data => data.mergedDetails?.length > 1

  const renderRoundedCell = (value) => <TableCell>{roundDecimal(value)}</TableCell>;

  const renderDetailsTable = (data) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{TABLE_COLUMNS.STORE}</TableCell>
          <TableCell>{TABLE_COLUMNS.HELPER_POINTS}</TableCell>
          <TableCell>{TABLE_COLUMNS.HELPER_PRICE}</TableCell>
          <TableCell>{`${TABLE_COLUMNS.PRODUCT_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
          {displayReportWithMembership && 
            <TableCell>{`${TABLE_COLUMNS.MEMBERSHIP_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
          }
        </TableRow>
      </TableHead>
      <TableBody>
        {data.mergedDetails.map((detail, detailIndex) => (
          <TableRow key={detailIndex}>
            <TableCell>{detail.storeName}</TableCell>
            {renderRoundedCell(detail.helperReceivedPoint)}
            {renderRoundedCell(detail.helperReceivedPrice)}
            {renderRoundedCell(detail.productTotal)}
            {displayReportWithMembership && renderRoundedCell(detail.membershipTotal)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderTotalCell = (key) => (
    <TableCell>
      {Math.round(report.reduce((accu, curVal) => accu + (curVal[key] || 0), 0))}
    </TableCell>
  );

  const renderTotalRow = () => (
    <TableRow>
      {hasMergedDetailsRows && <TableCell className='noprint'/>}
      <TableCell css={styles.designerName}>合計</TableCell>
      <TableCell />
      <TableCell />
      {renderTotalCell('helperReceivedPoint')}
      {renderTotalCell('helperReceivedPrice')}
      {renderTotalCell('productTotal')}
      {displayReportWithMembership && renderTotalCell('membershipTotal')}
    </TableRow>
  )

  return (
    <TableContainer className='HelperLeaderBoardTable' component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {hasMergedDetailsRows && <TableCell className='noprint'>{TABLE_COLUMNS.EXPAND}</TableCell>}
            <TableCell>{TABLE_COLUMNS.RANK}</TableCell>
            <TableCell>{TABLE_COLUMNS.DESIGNER}</TableCell>
            <TableCell>{TABLE_COLUMNS.STORE}</TableCell>
            <TableCell>{TABLE_COLUMNS.HELPER_POINTS}</TableCell>
            <TableCell>{TABLE_COLUMNS.HELPER_PRICE}</TableCell>
            <TableCell>{`${TABLE_COLUMNS.PRODUCT_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
            {displayReportWithMembership && 
              <TableCell>{`${TABLE_COLUMNS.MEMBERSHIP_TOTAL}(${performReference === 'TRUTH' ? '實' : '虛'})`}</TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {report.map((data, index) => {
            const hasMergedDetails = getHasMergedDetails(data)
            return (
              <Fragment key={index}>
                <TableRow>
                  {hasMergedDetailsRows &&
                    <TableCell className='noprint'>
                      {hasMergedDetails ? (
                        <IconButton
                        onClick={handleClick(index)}
                        style={{ width: 3, height: 3 }}
                        >
                          {isOpen(index) ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                        </IconButton>
                      ) : null}
                    </TableCell>
                  }
                  <TableCell>
                    <Typography variant="button">{index + 1}</Typography>
                  </TableCell>
                  <TableCell css={styles.designerName}>{data.userName}</TableCell>
                  <TableCell>{data.storeName}</TableCell>
                  {renderRoundedCell(data.helperReceivedPoint)}
                  {renderRoundedCell(data.helperReceivedPrice)}
                  {renderRoundedCell(data.productTotal)}
                  {displayReportWithMembership && renderRoundedCell(data.membershipTotal)}
                </TableRow>
                {hasMergedDetails &&
                  <TableRow className='noprint'>
                    <TableCell 
                      css={styles.collapseCell(isOpen(index))}
                      colSpan={hasMergedDetailsRows ? 8 : 7}
                    >
                      <Collapse timeout='auto' unmountOnExit in={isOpen(index)}>
                        <Box margin={2}>
                          {renderDetailsTable(data)}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                }
              </Fragment>
            )
          })}
          {renderTotalRow()}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.propTypes = {
  report: PropTypes.array,
}

Results.defaultProps = {
  report: [],
}

export default Results
