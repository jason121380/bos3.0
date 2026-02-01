/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { format } from 'date-fns'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  card: css({
    margin: theme.spacing(3, 0, 3, 0),
  }),
}

export default function TotalPrice({ startDate, endDate, rev, exp }) {
  return (
    <Card css={styles.card}>
      <CardHeader
        title={`${format(startDate, 'yyyy-MM-dd')} ~ ${format(endDate, 'yyyy-MM-dd')} 合計`}
      />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>收入</TableCell>
              <TableCell>支出</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{rev}</TableCell>
              <TableCell>{exp}</TableCell>
              <TableCell>{rev - exp}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
