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

function AccountingRecords() {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} title="收支報表" />
      <Divider />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <div css={styles.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日期</TableCell>
                  <TableCell>科目名稱</TableCell>
                  <TableCell>收入</TableCell>
                  <TableCell>支出</TableCell>
                  <TableCell>員工</TableCell>
                  <TableCell>收付方式</TableCell>
                  <TableCell>備註</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2019/12/19</TableCell>
                  <TableCell>員工借支</TableCell>
                  <TableCell>244</TableCell>
                  <TableCell></TableCell>
                  <TableCell>Lyida / 22</TableCell>
                  <TableCell>櫃檯支出</TableCell>
                  <TableCell>刮刀 亮光劑</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>合計</TableCell>
                  <TableCell></TableCell>
                  <TableCell>345</TableCell>
                  <TableCell>-345</TableCell>
                  <TableCell>34345</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  )
}

export default AccountingRecords
