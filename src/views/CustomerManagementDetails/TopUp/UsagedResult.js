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
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { css } from '@emotion/react'
import { theme } from '../../../theme'

const styles = {
  root: css({}),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 800,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
}

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, pagenationLabel, ...rest }) {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, walletUseRecord])

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)} 筆資料,{' '}
        {resultSetting.usaged.pageOffset + 1}/
        {Math.ceil(
          idx(walletUseRecord.data, _ => _.walletUseRecord.record.length) /
          resultSetting.usaged.pageLimit
        )}
      </Typography>
      <Card>
        <CardHeader title="入金使用" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>
                    <TableCell>帳單編號/時間</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>使用金額</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {idx(walletUseRecord.data, _ =>
                    _.walletUseRecord.record.map((data, index) => (
                      <TableRow hover key={`${data.id}-${data.index}`}>
                        <TableCell>
                          <Button
                            color="primary"
                            variant="outlined"
                            component={RouterLink}
                            to={`/order/${data.order.id}`}
                          >
                            訂單詳情
                          </Button>
                        </TableCell>
                        <TableCell>
                          {data.orderNo}
                          <Typography>{format(data.date, 'MM/dd/yyyy')}</Typography>
                        </TableCell>
                        <TableCell>
                          {idx(data.Customer, _ => _.name)}
                          <Typography>{idx(data.Customer, _ => _.cellphone)}</Typography>
                        </TableCell>
                        <TableCell>
                          {idx(
                            data.Designer,
                            _ => `${_.name} ${_.designerNo ? ' / ' + _.designerNo : ''}`
                          )}
                        </TableCell>
                        <TableCell>{data.money}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow>
                    <TableCell colSpan={3}></TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {idx(walletUseRecord, _ =>
                        _.data.walletUseRecord.record.reduce((prev, next) => prev + next.money, 0)
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={walletUseRecord.data === undefined ? 0 : idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.usaged.pageOffset}
            rowsPerPage={resultSetting.usaged.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar />
    </div>
  )
}

UsagedResult.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

UsagedResult.defaultProps = {
  customers: [],
}

export default UsagedResult
