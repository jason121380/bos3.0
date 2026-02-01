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
  content: css({
    padding: 0,
  }),
  inner: css({
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

function Customer({ customer }) {
  const genderCustomerCount =
    customer.femaleCustomerCount + customer.maleCustomerCount + customer.unKnowCustomerCount
  const designateAndNotDesignateCustomerCount =
    customer.designateCustomerCount + customer.notDesignateCustomerCount
  return (
    <Card>
      <CardHeader title="來客分析" />
      <Divider />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <Table css={styles.inner}>
            <TableHead>
              <TableRow>
                <TableCell>總客次</TableCell>
                <TableCell>客單價</TableCell>
                <TableCell>指定客</TableCell>
                <TableCell>不指定</TableCell>
                <TableCell>男客</TableCell>
                <TableCell>女客</TableCell>
                <TableCell>未知性別</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell rowSpan={2}>{designateAndNotDesignateCustomerCount}</TableCell>
                <TableCell rowSpan={2}>{customer.customerAvgAmount}</TableCell>
                <TableCell>{customer.designateCustomerCount}</TableCell>
                <TableCell>{customer.notDesignateCustomerCount}</TableCell>
                <TableCell>{customer.maleCustomerCount}</TableCell>
                <TableCell>{customer.femaleCustomerCount}</TableCell>
                <TableCell>{customer.unKnowCustomerCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {(isNaN(customer.designateCustomerCount / designateAndNotDesignateCustomerCount)
                    ? 0
                    : (customer.designateCustomerCount / designateAndNotDesignateCustomerCount) *
                    100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(
                    customer.notDesignateCustomerCount / designateAndNotDesignateCustomerCount
                  )
                    ? 0
                    : (customer.notDesignateCustomerCount / designateAndNotDesignateCustomerCount) *
                    100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(customer.maleCustomerCount / genderCustomerCount)
                    ? 0
                    : (customer.maleCustomerCount / genderCustomerCount) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(customer.femaleCustomerCount / genderCustomerCount)
                    ? 0
                    : (customer.femaleCustomerCount / genderCustomerCount) * 100
                  ).toFixed(2)}
                  %
                </TableCell>
                <TableCell>
                  {(isNaN(customer.unKnowCustomerCount / genderCustomerCount)
                    ? 0
                    : (customer.unKnowCustomerCount / genderCustomerCount) * 100
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

export default Customer
