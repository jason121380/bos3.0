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
import { format } from 'date-fns'
import React from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1300,
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

function OrderRecord({ records }) {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} title="互助紀錄" />
      <Divider />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <Table css={styles.inner}>
            <TableHead>
              <TableRow>
                <TableCell>日期</TableCell>
                <TableCell>帳單編號</TableCell>
                <TableCell>服務項目</TableCell>
                <TableCell>人員</TableCell>
                <TableCell>抽固定金額</TableCell>
                <TableCell>點數</TableCell>
                <TableCell>點數換算</TableCell>
                <TableCell>抽%</TableCell>
                <TableCell>抽%換算</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map(data => (
                <TableRow key={`serviceOrderHelpers-${data.id}`}>
                  <TableCell>
                    {format(new Date(data.serviceOrder.order.date), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>#{data.serviceOrder.order.no}</TableCell>
                  <TableCell>{data.serviceOrder.order.previewItem.join('、')}</TableCell>
                  <TableCell>
                    {data.serviceOrder.order.designer.name}
                    {data.serviceOrder.order.designer.designerNo !== null &&
                      data.serviceOrder.order.designer.designerNo
                      ? ' / ' + data.serviceOrder.order.designer.designerNo
                      : ''}
                  </TableCell>
                  <TableCell>{data.serviceOrder.order.designer.name}</TableCell>
                  <TableCell>{data.fixCommissionAmount}</TableCell>
                  <TableCell>{data.point}</TableCell>
                  <TableCell>{data.commissionPercent}</TableCell>
                  <TableCell>{data.commissionAmount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  )
}

export default OrderRecord
