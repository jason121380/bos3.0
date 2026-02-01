/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Paper, TableContainer, Typography, Collapse, Box, IconButton
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isSameDay } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
    whiteSpace: 'nowrap !important'
  }),
}

function Results({
  report,
  performReference,
  monthlyAveragePerformanceTotal,
  monthlyAverageDisplayForDesignerLeaderBoard,
  isSubmit,
  membershipDisplay,
  performanceDisplay,
  dataDisplay,
}) {
  const [open, setOpen] = useState([])
  const referenceLabel = performReference === 'TRUTH' ? '實' : '虛'
  const hasMergedDetailsRows = report.some(data => data.mergedDetails.length > 1)

  const tableHeadCells = [
    hasMergedDetailsRows && { label: '展開', className: 'noprint' },
    { label: '名次' },
    { label: '設計師', css: styles.designerName },
    { label: '所屬店家', style: { whiteSpace: 'nowrap' } },
    { label: '總業績' },
    monthlyAverageDisplayForDesignerLeaderBoard && { label: '服務業績月平均' },
    dataDisplay.isDRRPEVDisplay && { label: '業績年預估值' },
    { label: `服務總業績(${referenceLabel})` },
    performanceDisplay === 'VISIBLE' && { label: `服務業績(指)(${referenceLabel})` },
    performanceDisplay === 'VISIBLE' && { label: `服務業績(不指)(${referenceLabel})` },
    { label: `卡券使用業績(${referenceLabel})` },
    { label: `卡券販賣(入業績)(${referenceLabel})` },
    { label: `店販業績(${referenceLabel})` },
    membershipDisplay && { label: `會員卡業績(${referenceLabel})` },
    { label: '互助使用(點數/金額)' },
    dataDisplay.isDRROCDisplay && { label: '客次數' },
  ].filter(Boolean)

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

  const handleCountSummary = key => {
    return Math.round(report.reduce((acc, cur) => acc + cur[key], 0))
  }

  const isOpen = (index) =>  open.includes(index)

  const getHasMergedDetails = data => data.mergedDetails.length > 1

  const renderCell = (value, idx) => <TableCell key={`cell-${idx}`}>{Math.round(value)}</TableCell>

  return (
    isSubmit && 
    <TableContainer className='DesignerPerformBasicTable' component={Paper}>
      <Table css={styles.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {tableHeadCells.map(({label, ...cell}, index) => (
              <TableCell key={index} {...cell}>
                {label}
              </TableCell>
            ))}
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
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{data.storeName}</TableCell>
                  {[
                    data.businessPerformanceTotal,
                    monthlyAverageDisplayForDesignerLeaderBoard ? data.monthlyAveragePerformance : null,
                    dataDisplay.isDRRPEVDisplay ? data.performanceEV : null,
                    data.serviceTotal,
                    performanceDisplay === 'VISIBLE' ? data.designateServiceTotal : null,
                    performanceDisplay === 'VISIBLE' ? data.nonDesignateServiceTotal : null,
                    data.usedTicketTotal,
                    data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate,
                    data.productTotal,
                    membershipDisplay ? data.membershipTotal : null,
                  ].map((value, idx) => value !== null ? renderCell(value, idx) : null)}
                  <TableCell>
                    {Math.round(data.helperPaidPoint)}/{Math.round(data.helperPaidPrice)}
                  </TableCell>
                  {dataDisplay.isDRROCDisplay && <TableCell>{data.orderCount}</TableCell>}
                </TableRow>
                {hasMergedDetails &&
                  <TableRow className='noprint'>
                    <TableCell 
                      style={{ 
                        padding: 0, 
                        borderBottom: isOpen(index) ? undefined : 'none'
                      }} 
                      colSpan={tableHeadCells.length}
                    >
                      <Collapse timeout='auto' unmountOnExit in={isOpen(index)}>
                        <Box margin={2}>
                          <Table className='multiMerchantsLeaderBoardCollapse'>
                            <TableHead>
                              <TableRow>
                                {tableHeadCells.slice(3).map(({label, ...cell}, index) => (
                                  <TableCell key={index} {...cell}>
                                    {label}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.mergedDetails.map((detail, detailIndex) => (
                                <TableRow key={detailIndex}>
                                  <TableCell style={{ whiteSpace: 'nowrap' }}>{detail.storeName}</TableCell>
                                  {[
                                    detail.businessPerformanceTotal,
                                    monthlyAverageDisplayForDesignerLeaderBoard ? detail.monthlyAveragePerformance : null,
                                    dataDisplay.isDRRPEVDisplay ? detail.performanceEV : null,
                                    detail.serviceTotal,
                                    performanceDisplay === 'VISIBLE' ? detail.designateServiceTotal : null,
                                    performanceDisplay === 'VISIBLE' ? detail.nonDesignateServiceTotal : null,
                                    detail.usedTicketTotal,
                                    detail.ticketSellIntoPerformanceDesignate + detail.ticketSellIntoPerformanceNonDesignate,
                                    detail.productTotal,
                                    membershipDisplay ? detail.membershipTotal : null,
                                  ].map((value, idx) => value !== null ? renderCell(value, idx) : null)}
                                  <TableCell>
                                    {Math.round(detail.helperPaidPoint)}/{Math.round(detail.helperPaidPrice)}
                                  </TableCell>
                                  {dataDisplay.isDRROCDisplay && <TableCell>{detail.orderCount}</TableCell>}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                }
              </Fragment>
            )
          })}
          <TableRow>
            {hasMergedDetailsRows && 
              <TableCell className='noprint'/>
            }
            <TableCell css={styles.designerName}>合計</TableCell>
            <TableCell />
            <TableCell />
            {[
              handleCountSummary('businessPerformanceTotal'),
              monthlyAverageDisplayForDesignerLeaderBoard ? monthlyAveragePerformanceTotal : null,
              dataDisplay.isDRRPEVDisplay ? handleCountSummary('performanceEV') : null,
              handleCountSummary('serviceTotal'),
              performanceDisplay === 'VISIBLE' ? handleCountSummary('designateServiceTotal') : null,
              performanceDisplay === 'VISIBLE' ? handleCountSummary('nonDesignateServiceTotal') : null,
              handleCountSummary('usedTicketTotal'),
              handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
              handleCountSummary('productTotal'),
              membershipDisplay ? handleCountSummary('membershipTotal') : null,
            ].map((value, idx) => value !== null ? <TableCell key={idx}>{Math.round(value)}</TableCell> : null)}
            <TableCell>
              {handleCountSummary('helperPaidPoint')}/{handleCountSummary('helperPaidPrice')}
            </TableCell>
            {dataDisplay.isDRROCDisplay && <TableCell>{handleCountSummary('orderCount')}</TableCell>}
          </TableRow>
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
