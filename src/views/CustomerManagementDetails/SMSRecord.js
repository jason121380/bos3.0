/** @jsxImportSource @emotion/react */
import {
  Table,TableBody,TableCell,
  TableHead,TableRow,TableContainer,
  Card, Typography
} from '@mui/material'
import { format } from 'date-fns';
import { Fragment } from 'react'
import { css } from '@emotion/react'

const styles = {
  root: css({
    '& td': {
      whiteSpace: 'nowrap !important'
    }
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
    outline: '1px solid #eeeeee',
  }),
}

function SMSRecord({ records }) {
  return (
    <Fragment>
      {records.length === 0 ?
        <Typography variant="h3" style={{ textAlign: 'center', marginTop: 50 }}>
          無資料
        </Typography> :
        <Card>
          <TableContainer style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table>
              <TableHead>
                <TableRow css={styles.stickyRow}>
                  <TableCell>日期</TableCell>
                  <TableCell>時間</TableCell>
                  <TableCell>手機號碼</TableCell>
                  <TableCell>簡訊內容</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map(({date, cellphone, message}, i) => (
                  <TableRow key={`${date}-${i}`}>
                    <TableCell>{format(date, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>{format(date, 'H:mm')}</TableCell>
                    <TableCell>{cellphone}</TableCell>
                    <TableCell>{message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      }
    </Fragment>
  )
}

export default SMSRecord