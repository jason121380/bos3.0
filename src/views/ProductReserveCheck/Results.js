/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, Grid, Typography
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import clsx from 'clsx'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  br: css({
    borderRight: '1px solid rgb(var(--border))'
  }),
  brBold: css({
    borderRight: '1.5px solid grey'
  }),
  bbBold: css({
    borderBottom: '1.5px solid grey'
  }),
  cell: css({
    padding: '4px 12px',
    minWidth: 100
  }),
  sticky: css({
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    zIndex: '99',
    wordBreak: 'break-all',
    minWidth: 120,
    border: 'none'
  }),
  stickyRow: css({
    position: 'sticky',
    background: 'white',
    zIndex: '100',
    outline: '1px solid grey',
    height: 30,
    border: 'none'
  }),
}

function Results({ reportData }) {
  const { reserveCheckSummary, productReserveChecks } = reportData
  return (
    <Fragment>
      {reserveCheckSummary.length === 0 ? (
        <Typography style={{ textAlign: 'center', marginTop: 100 }} variant="h3" gutterBottom component="div">無資料</Typography>
      ) : (
        <Grid style={{ overflow: 'auto', marginTop: 12 }} justifyContent='flex-start' spacing={2} container direction='row' >
          <Grid item xs={12} md={3}>
            <TableContainer style={{ maxHeight: '80vh', overflowY: 'auto' }} component={Paper}>
              <Table size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow css={styles.stickyRow} style={{ top: 0 }} >
                    <TableCell style={{ border: 'none' }}>品名</TableCell>
                    <TableCell style={{ border: 'none' }}>數量</TableCell>
                    <TableCell style={{ border: 'none' }}>價格</TableCell>
                    <TableCell style={{ border: 'none' }}>庫存金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reserveCheckSummary.map(d => (
                    <TableRow key={d.id} hover>
                      <TableCell>{d.productName}</TableCell>
                      <TableCell>{d.reserveCount}</TableCell>
                      <TableCell>{d.price}</TableCell>
                      <TableCell>{d.reservePrice}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow hover >
                    <TableCell colSpan={2}></TableCell>
                    <TableCell><strong>合計</strong></TableCell>
                    <TableCell>{reserveCheckSummary.reduce((a, b) => a + b.reservePrice , 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid xs={12} md={9} item>
            <TableContainer style={{ maxHeight: '80vh', overflowY: 'auto' }} component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow css={styles.stickyRow} style={{ top: 0 }}>
                    <TableCell css={css([styles.brBold, styles.bbBold, styles.sticky])}>品名</TableCell>
                    {productReserveChecks.map(d => (
                      <TableCell key={d.id} align='center' css={css([styles.brBold, styles.bbBold, styles.cell])} colSpan={3}>{d.productName}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow css={styles.stickyRow} style={{ top: 30 }}>
                    <TableCell css={css([styles.brBold, styles.sticky])}>本期</TableCell>
                    {productReserveChecks.map((d, i) => (
                      <Fragment key={`stockLabel-${i}`}>
                        <TableCell style={{ border: 'none' }} align='center' >進</TableCell>
                        <TableCell style={{ border: 'none' }} align='center' >發</TableCell>
                        <TableCell align='center' style={{ borderBottom: 'none' }} css={styles.brBold}>存</TableCell>
                      </Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productReserveChecks[0].reserveChecks.map((d, i) => (
                    <TableRow key={`${d.title}-${i}`} hover>
                      <TableCell style={{ outline: '1px solid #eeeeee' }} css={css([styles.brBold, styles.sticky])}>{d.title}</TableCell>
                      {productReserveChecks.map(({ reserveChecks }) => {
                        return (
                          <Fragment>
                            <TableCell align='center' sx={{ color: '#6565ff !important' }} css={styles.br}>{reserveChecks[i].isCreated ? reserveChecks[i].in : '-'}</TableCell>
                            <TableCell align='center' sx={{ color: '#ff4040 !important' }} css={styles.br}>{reserveChecks[i].isCreated ? reserveChecks[i].out : '-'}</TableCell>
                            <TableCell align='center' css={styles.brBold}>{reserveChecks[i].isCreated ? reserveChecks[i].balance : '-'}</TableCell>
                          </Fragment>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Fragment>
  )
}

Results.propTypes = {
  reportData: PropTypes.object,
}

Results.defaultProps = {
  reportData: {},
}

export default Results