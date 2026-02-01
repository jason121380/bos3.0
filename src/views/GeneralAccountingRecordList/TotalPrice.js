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
    margin: theme.spacing(1.5, 0),
    boxShadow: 'none !important',
    border: '1px solid #f0f0f0 !important',
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '4px',
        height: '16px',
        backgroundColor: '#1A73E8',
        marginRight: '8px',
        borderRadius: '2px',
      },
    },
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
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
            <TableRow>
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
