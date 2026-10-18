/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Grid,
} from '@mui/material'
import PropTypes from 'prop-types'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    // minWidth: 900,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
  orderNoLink: css({
    textDecorationLine: 'underline',
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--background)) !important',
    },
  }),
  tableContainer: css({
    boxShadow: 'none !important',
    backgroundColor: 'rgb(var(--background)) !important',
    border: 'none !important',
  }),
}

function Results({ results }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="其他支付方式明細" css={styles.cardHeader} />
          <CardContent css={styles.content}>
            <div css={styles.inner}>
              <TableContainer component={Paper} css={styles.tableContainer} elevation={0}>
                <Table size="small" aria-label="a dense table">
                  <TableBody>
                    {results.otherPayway.map((data, index) => (
                      <TableRow key={index} css={styles.tableRow}>
                        <TableCell>{data.paywayName}</TableCell>
                        <TableCell>{data.usedPrice}</TableCell>
                        <TableCell>({data.usedPriceWithNoCash})</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="第三方卡券明細" css={styles.cardHeader} />
          <CardContent css={styles.content}>
            <div css={styles.inner}>
              <TableContainer component={Paper} css={styles.tableContainer} elevation={0}>
                <Table size="small" aria-label="a dense table">
                  <TableBody>
                    {results.thirdPartTicket.map((data, index) => (
                      <TableRow key={index} css={styles.tableRow}>
                        <TableCell>{data.ticketName}</TableCell>
                        <TableCell>{data.usedPrice}</TableCell>
                        <TableCell>({data.usedPriceWithNoCash})</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Card>
          <CardHeader title="入金儲值明細" css={styles.cardHeader} />
          <CardContent css={styles.content}>
            <div css={styles.inner}>
              <TableContainer component={Paper} css={styles.tableContainer} elevation={0}>
                <Table size="small" aria-label="a dense table">
                  <TableBody>
                    {results.walletDeposit.map((data, index) => (
                      <TableRow key={index} css={styles.tableRow}>
                        <TableCell>{data.paywayName}</TableCell>
                        <TableCell>{data.usedPrice}</TableCell>
                        <TableCell>({data.usedPriceWithNoCash})</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
