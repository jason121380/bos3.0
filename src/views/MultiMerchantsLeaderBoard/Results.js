/** @jsxImportSource @emotion/react */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Collapse,
  Box,
  IconButton
} from '@mui/material'
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from 'ui/icons'
import { useState, Fragment } from 'react'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  sepreateDiv: css({
    display: 'flex',
    justifyContent: 'space-around',
  }),
  centerTd: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  sticky: css({
    width: '150px',
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
  }),
  Box: css({
    borderRadius: 4,
    overflow: 'hidden',
    boxShadow: '0px 1px 3px 0px rgb(0 0 0 / 12%)',
    '& th': {
      backgroundColor: 'gray !important',
    }
  })
}

export default function Results({ reportData }) {
  const [open, setOpen] = useState([])
  return (
    <TableContainer style={{ maxHeight: 'calc(100vh - 260px)' }} className='multiMerchantsLeaderBoardTable' component={Paper}>
      <Table css={styles.root} size="small" aria-label="a dense table">
        <TableHead css={styles.stickyRow}>
          <TableRow>
            <TableCell className='noprint'>展開</TableCell>
            <TableCell>排名</TableCell>
            <TableCell>店家名稱</TableCell>
            <TableCell>販售人名稱</TableCell>
            <TableCell>販售人代號</TableCell>
            <TableCell>總業績</TableCell>
            <TableCell>總數量</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reportData.map((d, index) => (
            <Fragment key={index}>
              <TableRow hover style={{ cursor: 'pointer' }} onClick={() => {
                const idx = open.indexOf(index)
                if (idx > -1) {
                  const arr = open
                  arr.splice(idx, 1)
                  setOpen([...arr])
                } else {
                  setOpen([...open, index])
                }
              }}>
                <TableCell className='noprint'>
                  <IconButton >
                    {open.indexOf(index) > -1 ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                  </IconButton>
                </TableCell>
                <TableCell>{d.sorting}</TableCell>
                <TableCell>{d.merchantName}</TableCell>
                <TableCell>{d.sellerName}</TableCell>
                <TableCell>{d.sellerNo ? d.sellerNo : ''}</TableCell>
                <TableCell>{roundDecimal(d.totalPerformance)}</TableCell>
                <TableCell>{d.totalCount}</TableCell>
              </TableRow>
              <TableRow className='noprint'>
                <TableCell style={{ padding: 0 }} colSpan={7}>
                  <Collapse timeout="auto" unmountOnExit in={open.indexOf(index) > -1}>
                    <Box className={styles.Box} margin={2}>
                        <Table className='multiMerchantsLeaderBoardCollapse'>
                          <TableHead>
                            <TableRow>
                              <TableCell>商品名稱</TableCell>
                              <TableCell>商品編號</TableCell>
                              <TableCell>業績</TableCell>
                              <TableCell>數量</TableCell>
                              <TableCell>單位</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                          {d.productDetail.map((detail, index) => (
                            <TableRow key={`${detail.productName}-${d.sellerName}-${index}`}>
                              <TableCell>{detail.productName}</TableCell>
                              <TableCell>{detail.productNo}</TableCell>
                              <TableCell>{detail.performance}</TableCell>
                              <TableCell>{detail.count}</TableCell>
                              <TableCell>{detail.unit}</TableCell>
                            </TableRow>
                          ))}
                          </TableBody>
                        </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
          <TableRow>
            <TableCell colSpan={4} />
            <TableCell><strong>合計</strong></TableCell>
            <TableCell><strong>{parseFloat(reportData.reduce((a, b) => a + roundDecimal(b.totalPerformance), 0).toFixed(2))}</strong></TableCell>
            <TableCell><strong>{reportData.reduce((a, b) => a + b.totalCount, 0)}</strong></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

Results.defaultProps = {}