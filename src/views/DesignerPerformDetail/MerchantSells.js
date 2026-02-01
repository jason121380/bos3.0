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
import GenericMoreButton from 'components/GenericMoreButton'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1200,
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

function MerchantSells({ merchantSells }) {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} title="店販分析" />
      <Divider />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <Table css={styles.inner}>
            <TableHead>
              <TableRow>
                <TableCell>類別代號</TableCell>
                <TableCell>類別名稱</TableCell>
                <TableCell>店販業績</TableCell>
                <TableCell>占總服務業績比</TableCell>
                <TableCell>客次</TableCell>
                <TableCell>單項卷業績佔比</TableCell>
                <TableCell>單項客次單價</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {merchantSells.map(data => (
                <TableRow key={`merchantSalesAnalytics-${data.id}`}>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{Math.round(data.analytics.productAmountTotal)}</TableCell>
                  <TableCell>
                    {(isNaN(
                      data.analytics.productAmountTotal /
                      merchantSells.reduce(
                        (total, item) => (total = total + item.analytics.productAmountTotal),
                        0
                      )
                    )
                      ? 0
                      : (data.analytics.productAmountTotal /
                        merchantSells.reduce(
                          (total, item) => (total = total + item.analytics.productAmountTotal),
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %
                  </TableCell>
                  <TableCell>{data.analytics.customerCount}</TableCell>
                  <TableCell>
                    {(isNaN(
                      data.analytics.customerCount /
                      merchantSells.reduce(
                        (total, item) => (total = total + item.analytics.customerCount),
                        0
                      )
                    )
                      ? 0
                      : (data.analytics.customerCount /
                        merchantSells.reduce(
                          (total, item) => (total = total + item.analytics.customerCount),
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %
                  </TableCell>
                  <TableCell>
                    {isNaN(data.analytics.productAmountTotal / data.analytics.customerCount)
                      ? 0
                      : Math.round(data.analytics.productAmountTotal) /
                      data.analytics.customerCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  )
}

export default MerchantSells
