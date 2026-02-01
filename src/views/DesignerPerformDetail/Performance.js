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
} from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  cardContent: css({
    padding: 0,
  }),
  table: css({
    minWidth: 700,
  }),
  progressContainer: css({
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  arrowForwardIcon: css({
    marginLeft: theme.spacing(1),
  }),
}

function Performance({ performance }) {
  const fakeSaleAndProductSale = performance.serviceFake + performance.productSales
  return (
    <Card>
      <CardHeader title="業績分析" />
      <Divider />
      <CardContent css={styles.cardContent}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <Table css={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell>總業績</TableCell>
                <TableCell>服務消費</TableCell>
                <TableCell>店販消費</TableCell>
                <TableCell>卡卷使用</TableCell>
                <TableCell>卡卷販賣(不入業績)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{Math.round(fakeSaleAndProductSale)}</TableCell>
                <TableCell>{Math.round(performance.serviceFake)}</TableCell>
                <TableCell>{Math.round(performance.productSales)}</TableCell>
                <TableCell>{Math.round(performance.useTicketSales)}</TableCell>
                <TableCell rowSpan={2}>{Math.round(performance.sellTicketSales)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>100%</TableCell>
                <TableCell>
                  {(isNaN(performance.serviceFake / fakeSaleAndProductSale)
                    ? 0
                    : (performance.serviceFake / fakeSaleAndProductSale) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(performance.productSales / fakeSaleAndProductSale)
                    ? 0
                    : (performance.productSales / fakeSaleAndProductSale) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(performance.useTicketSales / fakeSaleAndProductSale)
                    ? 0
                    : (performance.useTicketSales / fakeSaleAndProductSale) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  )
}

export default Performance
