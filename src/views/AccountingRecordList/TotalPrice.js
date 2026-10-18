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
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  card: css({
    margin: theme.spacing(1.5, 0),
    boxShadow: 'none !important',
    border: '1px solid rgb(var(--border)) !important',
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  tableRow: css({
    backgroundColor: 'rgb(var(--background)) !important',
  }),
}

export default function TotalPrice({ startDate, endDate, rev, exp }) {
  return (
    <Card css={styles.card}>
      <CardHeader
        css={styles.cardHeader}
        title={`${format(startDate, 'yyyy-MM-dd')} ~ ${format(endDate, 'yyyy-MM-dd')} 合計`}
      />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow css={styles.tableRow}>
              <TableCell>收入</TableCell>
              <TableCell>支出</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow css={styles.tableRow}>
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
