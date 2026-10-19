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
import GenericMoreButton from 'components/GenericMoreButton'
import PerfectScrollbar from 'react-perfect-scrollbar'

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

function Designer() {
  return (
    <Card>
      <CardHeader action={<GenericMoreButton />} title="設計師分析" />
      <div className="h-px bg-border" />
      <CardContent css={styles.content}>
        <PerfectScrollbar options={{ suppressScrollY: true }}>
          <div css={styles.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>設計師</TableCell>
                  <TableCell>服務業績</TableCell>
                  <TableCell>實業績</TableCell>
                  <TableCell>指定實業績</TableCell>
                  <TableCell>店販業績</TableCell>
                  <TableCell>總客次</TableCell>
                  <TableCell>指定</TableCell>
                  <TableCell>不指定</TableCell>
                  <TableCell>客單價 (虛)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>闕瑞揚Ryan</TableCell>
                  <TableCell>525</TableCell>
                  <TableCell>525</TableCell>
                  <TableCell>525</TableCell>
                  <TableCell></TableCell>
                  <TableCell>525</TableCell>
                  <TableCell>75</TableCell>
                  <TableCell>1208</TableCell>
                  <TableCell>17</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
      </CardContent>
    </Card>
  )
}

export default Designer
