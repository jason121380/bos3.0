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

function Service({ services }) {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} title="服務項目分析" />
      <Divider />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <Table css={styles.inner}>
            <TableHead>
              <TableRow>
                <TableCell>類別代號</TableCell>
                <TableCell>類別名稱</TableCell>
                <TableCell>服務業績</TableCell>
                <TableCell>占總服務業績比</TableCell>
                <TableCell>卷使用業績</TableCell>
                <TableCell>單項卷業績佔比</TableCell>
                <TableCell>客次</TableCell>
                <TableCell>占總客次比</TableCell>
                <TableCell>指定客次</TableCell>
                <TableCell>不指定客次</TableCell>
                <TableCell>單項指定率</TableCell>
                <TableCell>單項客單價</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((data, index) => (
                <TableRow key={`serviceCategoriesAnalytics-${data.id}-${index}`}>
                  <TableCell>{data.no}</TableCell>
                  <TableCell>{data.name}</TableCell>
                  <TableCell>{Math.round(data.analytics.serviceFakeTotal)}</TableCell>
                  <TableCell>
                    {(isNaN(
                      data.analytics.serviceFakeTotal /
                      services.reduce(
                        (total, item) => (total = total + item.analytics.serviceFakeTotal),
                        0
                      )
                    )
                      ? 0
                      : (data.analytics.serviceFakeTotal /
                        services.reduce(
                          (total, item) => (total = total + item.analytics.serviceFakeTotal),
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %
                  </TableCell>
                  <TableCell>{data.analytics.useTicketTotal}</TableCell>
                  <TableCell>
                    {(isNaN(
                      data.analytics.useTicketTotal /
                      services.reduce(
                        (total, item) => (total = total + item.analytics.useTicketTotal),
                        0
                      )
                    )
                      ? 0
                      : (data.analytics.useTicketTotal /
                        services.reduce(
                          (total, item) => (total = total + item.analytics.useTicketTotal),
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
                      services.reduce(
                        (total, item) => (total = total + item.analytics.customerCount),
                        0
                      )
                    )
                      ? 0
                      : (data.analytics.customerCount /
                        services.reduce(
                          (total, item) => (total = total + item.analytics.customerCount),
                          0
                        )) *
                      100
                    ).toFixed(2)}
                    %
                  </TableCell>
                  <TableCell>{data.analytics.designateCount}</TableCell>
                  <TableCell>{data.analytics.notDesignateCustomer}</TableCell>
                  <TableCell>
                    {(isNaN(data.analytics.designateCount / data.analytics.customerCount)
                      ? 0
                      : (data.analytics.designateCount / data.analytics.customerCount) * 100
                    ).toFixed(2)}
                    %
                  </TableCell>
                  <TableCell>
                    {Math.floor(
                      isNaN(data.analytics.serviceFakeTotal / data.analytics.customerCount)
                        ? 0
                        : Math.round(data.analytics.serviceFakeTotal) / data.analytics.customerCount
                    )}
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

export default Service
