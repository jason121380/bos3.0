/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  colors,
} from '@mui/material'
import { format } from 'date-fns'
import { useRef, useEffect } from 'react'
import pagenationLabel from './../../helper/pagenationLabel'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
  saveButton: css({
    color: theme.palette.common.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900],
    },
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
}

const AttendanceRecord = ({
  page,
  onChangePage,
  onChangeRowsPerPage,
  results,
  ...rest
}) => {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, pageRef.current])

  return (
    <div {...rest} css={styles.root}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {results.length} 筆, {page.offset + 1} / {Math.ceil(results.length / page.limit)}
      </Typography>
      <Card {...rest} css={styles.root}>
        <CardHeader title="打卡紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>時間</TableCell>
                <TableCell align="right">地點</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((data, idx) => (
                <TableRow key={`attendance-record-${idx}`}>
                  <TableCell>
                    {format(new Date(data.checkinDateTime), 'HH:mm:ss')}
                    <Typography variant="body2">
                      {format(new Date(data.checkinDateTime), 'MM/dd/yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="primary"
                      size="small"
                      href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                      variant="outlined"
                      target="_blank"
                    >
                      地點
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={page.count}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            page={page.offset}
            rowsPerPage={page.limit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
    </div>
  )
}

export default AttendanceRecord
