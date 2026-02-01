/** @jsxImportSource @emotion/react */
import {
  Table, TableRow, TableBody, TableCell, TableHead, TableContainer,
  Paper, Typography
} from '@mui/material'
import { css } from '@emotion/react'

const styles = {
  inner: css({
    minWidth: 700,
  }),
}

function Results({ reportData }) {
  return (
    <>
      {reportData.length ? (
        <TableContainer component={Paper} css={styles.inner}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名次</TableCell>
                <TableCell>姓名</TableCell>
                <TableCell>編號</TableCell>
                <TableCell>手機</TableCell>
                <TableCell>入金儲值</TableCell>
                <TableCell>消費次數</TableCell>
                <TableCell>所有消費金額</TableCell>
                <TableCell>入金消費</TableCell>
                <TableCell>非入金消費</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((data, i) => (
                <TableRow key={data.customerId} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{data.customerName}</TableCell>
                  <TableCell>{data.customerNo}</TableCell>
                  <TableCell>{data.customerPhone}</TableCell>
                  <TableCell>{data.price.walletDeposit}</TableCell>
                  <TableCell>{data.orderCount}</TableCell>
                  <TableCell>{data.price.all}</TableCell>
                  <TableCell>{data.price.wallet}</TableCell>
                  <TableCell>{data.price.notWallet}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography style={{ marginTop: 100 }} align='center' component='h1' variant='h3' >無資料</Typography>
      )}

    </>
  )
}

export default Results
