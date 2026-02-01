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
  Grid,
} from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import { useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { useHistory } from 'react-router'
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
  addWalletDiv: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  addWalletBtn: css({
    marginBottom: '10px',
  }),
  valueContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  item: css({
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      '&:not(:last-of-type)': {
        borderRight: `none`,
      },
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:last-of-type)': {
        borderBottom: `1px solid #424242`,
      },
    },
  }),
  balance: css({
    margin: theme.spacing(3, 0, 3, 0),
  }),
}

function Results({
  className,
  date,
  walletDepositRecord,
  onChange,
  resultSetting,
  walletBalance,
  pagenationLabel,
  ...rest
}) {
  const history = useHistory()
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, walletDepositRecord])

  const handleAddWalletClick = () => {
    history.push('/topup/create')
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card css={styles.balance}>
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid css={styles.item} item md={12} sm={12} xs={12}>
            <Typography component="h2" gutterBottom variant="h6">
              入金餘額
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{walletBalance}</Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
      <div css={styles.addWalletDiv}>
        <Typography color="textSecondary" variant="body2">
          共 {idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount)} 筆資料,
          {resultSetting.record.pageOffset + 1}/
          {Math.ceil(
            idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount) /
            resultSetting.record.pageLimit
          )}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          css={styles.addWalletBtn}
          onClick={handleAddWalletClick}
        >
          新增入金
        </Button>
      </div>

      <Card>
        <CardHeader title="入金紀錄" />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table>
                {/* head */}
                <TableHead>
                  <TableRow>
                    <TableCell>操作</TableCell>

                    <TableCell>日期</TableCell>
                    <TableCell>客戶</TableCell>
                    <TableCell>實際付款金額</TableCell>
                    <TableCell>入金金額</TableCell>
                    <TableCell>設計師</TableCell>
                    <TableCell>付款方式</TableCell>
                    <TableCell>入金儲值手續費負擔方</TableCell>
                    <TableCell>入金儲值手續費</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {idx(walletDepositRecord.data, _ =>
                    _.walletDepositRecord.record.map(record => (
                      <TableRow hover key={record.id}>
                        <TableCell>
                          <Button
                            color="primary"
                            component={RouterLink}
                            size="small"
                            to={`/topup/edit/${record.id}`}
                            variant="outlined"
                          >
                            編輯
                          </Button>
                        </TableCell>
                        <TableCell>{format(record.date, 'MM/dd/yyyy')}</TableCell>
                        <TableCell>
                          {record.Customer.name}
                          <Typography>{record.Customer.cellphone}</Typography>
                        </TableCell>
                        <TableCell>
                          {record.handlingFeeDecountWay === 'BYCUSTOMER'
                            ? record.money + Math.abs(record.handlingFeeDecountPrice)
                            : record.money}
                        </TableCell>
                        <TableCell>{record.money}</TableCell>
                        <TableCell>
                          {record.Maker.name}
                          {record.Maker.designerNo ? ' / ' + record.Maker.designerNo : ''}
                        </TableCell>
                        <TableCell>{record.payType}</TableCell>
                        <TableCell>
                          {record.handlingFeeDecountWay === 'BYCUSTOMER'
                            ? '由客人負擔'
                            : record.handlingFeeDecountWay === 'BYDESIGNER'
                              ? '由設計師負擔'
                              : '不扣項'}
                        </TableCell>
                        <TableCell>{record.handlingFeeDecountPrice}</TableCell>
                        <TableCell>{record.remark}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow hover>
                    <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
                    <TableCell colSpan={3} />
                    <TableCell style={{ fontWeight: 'bold' }}>
                      {idx(walletDepositRecord, _ =>
                        _.data.walletDepositRecord.record.reduce(
                          (prev, next) => prev + next.money,
                          0
                        )
                      )}
                    </TableCell>
                    <TableCell colSpan={5}></TableCell>
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
            count={walletDepositRecord.data === undefined ? 0 : idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount)}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.record.pageOffset}
            rowsPerPage={resultSetting.record.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions>
      </Card>
      <TableEditBar />
    </div>
  )
}

export default Results
