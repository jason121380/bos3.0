/** @jsxImportSource @emotion/react */
import {
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  TableContainer,
  IconButton,
} from '@mui/material'
import { LockOpenOutlined as LockOpenOutlinedIcon } from 'ui/icons'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect, useRef } from 'react'
import useFetchSetRestoreDailyAccount from 'hooks/useFetchSettingRestoreDailyAccount'
import idx from 'idx'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { CSVLink } from "react-csv";
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme/index.js'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1300,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-title': {
      fontSize: '15px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
    },
  }),
  csvBtn: css({
    borderRadius: '20px !important',
    padding: '6px 20px !important',
    fontSize: '14px !important',
    boxShadow: 'none !important',
    fontWeight: 'bold !important',
    backgroundColor: 'rgb(var(--surface)) !important',
    color: 'rgb(var(--text-secondary)) !important',
    textTransform: 'none !important',
    border: 'none !important',
    '&:hover': {
      backgroundColor: 'rgb(var(--surface)) !important',
    }
  }),
  tableCell: css({
    padding: '6px 16px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
    '&.cashSaving': {
      backgroundColor: 'rgba(26, 115, 232, 0.1) !important',
      color: 'rgb(var(--accent)) !important',
      fontWeight: 'bold !important',
    }
  }),
}

function Results({
  className,
  dailyMoneyFlowResult,
  pageSetting,
  onPageChange,
  onRowsPerPageChange,
  waitCloseOrderDateLoading,
  isMemberShipCardActive,
  bonusDisplay,
  pagenationLabel,
  ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [restorePwd, setRestorePwd] = useState('')
  const [dateForRestore, setDateForRestore] = useState(null)
  const [dateOnDialogTitle, setDateOnDialogTitle] = useState('')
  const [disableRestoreCheckout, setDisableRestoreCheckout] = useState(false)
  const passwordData = useFetchMerchantPassword()
  const pageRef = useRef(null)

  useEffect(() => {
    if (!passwordData.loading) {
      const disableRestoreCheckout = idx(
        passwordData,
        _ => _.data.merchantPassword.restoreCheckout.isUsing
      )
      setDisableRestoreCheckout(disableRestoreCheckout)
    }
  }, [passwordData.loading])

  const { setRestoreDailyAccount } = useFetchSetRestoreDailyAccount()

  useEffect(() => {
    const sortByDate = dailyMoneyFlowResult.data
      .filter(result => result.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    const data = sortByDate.map(result => ({
      營業日期: format(new Date(result.date), 'yyyy/MM/dd'),
      服務消費: Math.round(result.service),
      店販消費: Math.round(result.product),
      會員卡消費: Math.round(result.membership),
      '卡券使用(入業績)': Math.round(result.usedTicket),
      '卡券販賣(入業績)': Math.round(result.ticketSellIntoPerformance),
      業績收入: Math.round(result.performanceIncome),
      '卡券販賣(不入業績)': Math.round(result.ticketSellNotIntoPerformance),
      '入金儲值(不入業績)': Math.round(result.walletDeposit),
      '卡券使用(-)': Math.round(result.usedTicketForDecount),
      '第三方卡券(-)': Math.round(result.thirdPartTicketForDecount),
      '其他付款方式(-)': Math.round(result.otherPayWayForDecount),
      '入金使用(-)': Math.round(result.walletUsedForDecount),
      '點數折抵金額(-)': Math.round(result.bonusDecountForReport),
      營業現金應收: Math.round(result.businessCash),
      現金收支收入: Math.round(result.cashRevenue),
      '現金收支支出(-)': Math.round(result.cashExpenditure),
      現金自購收入: Math.round(result.picking),
      現金結存: Math.round(result.cashBalance),
      最後結帳日期: format(result.lastCheckoutDateTime, 'yyyy/MM/dd'),
      結帳人: result.checkoutStaff === null ? '' : result.checkoutStaff.name,
    }))
    const total = {
      營業日期: '合計',
      服務消費: Math.round(dailyMoneyFlowResult.summary.service),
      店販消費: Math.round(dailyMoneyFlowResult.summary.product),
      會員卡消費: Math.round(dailyMoneyFlowResult.summary.membership),
      '卡券使用(入業績)': Math.round(dailyMoneyFlowResult.summary.usedTicket),
      '卡券販賣(入業績)': Math.round(dailyMoneyFlowResult.summary.ticketSellIntoPerformance),
      業績收入: Math.round(dailyMoneyFlowResult.summary.performanceIncome),
      '卡券販賣(不入業績)': Math.round(dailyMoneyFlowResult.summary.ticketSellNotIntoPerformance),
      '入金儲值(不入業績)': Math.round(dailyMoneyFlowResult.summary.walletDeposit),
      '卡券使用(-)': Math.round(dailyMoneyFlowResult.summary.usedTicketForDecount),
      '第三方卡券(-)': Math.round(dailyMoneyFlowResult.summary.thirdPartTicketForDecount),
      '其他付款方式(-)': Math.round(dailyMoneyFlowResult.summary.otherPayWayForDecount),
      '入金使用(-)': Math.round(dailyMoneyFlowResult.summary.walletUsedForDecount),
      '點數折抵金額(-)': Math.round(dailyMoneyFlowResult.summary.bonusDecountForReport),
      營業現金應收: Math.round(dailyMoneyFlowResult.summary.businessCash),
      現金收支收入: Math.round(dailyMoneyFlowResult.summary.cashRevenue),
      '現金收支支出(-)': Math.round(dailyMoneyFlowResult.summary.cashExpenditure),
      現金自購收入: Math.round(dailyMoneyFlowResult.summary.picking),
      現金結存: Math.round(dailyMoneyFlowResult.summary.cashBalance),
    }
    let excelData = [...data, total]
    if (!isMemberShipCardActive) {
      excelData = excelData.map(({ 會員卡消費, ...rest }) => rest)
    }
    if (!bonusDisplay) {
      excelData = excelData.map(({ ["點數折抵金額(-)"]: value, ...rest }) => rest)
    }
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [dailyMoneyFlowResult, isMemberShipCardActive, pageRef.current])

  const handleOpenDialog = date => {
    if (disableRestoreCheckout) {
      setOpenDialog(true)
      setDateForRestore(date)
      setDateOnDialogTitle(format(new Date(date), 'yyyy/MM/dd'))
    }
  }

  const handleRestoreDailyAccount = date => {
    setRestoreDailyAccount(
      disableRestoreCheckout ? { date: dateForRestore, password: restorePwd } : { date }
    )
      .then(() => {
        openSnackbar({ variant: 'success', message: '日結解除成功' })
        setOpenDialog(false)
        setRestorePwd('')
        setDateForRestore(null)
        setDateOnDialogTitle('')
        window.location.reload()
      })
      .catch(err => {
        setOpenDialog(false)
        setRestorePwd('')
        setDateForRestore(null)
        setDateOnDialogTitle('')
      })
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setRestorePwd('')
    setDateForRestore(null)
    setDateOnDialogTitle('')
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Card>
        <CardHeader
          css={styles.cardHeader}
          action={
            <CSVLink data={excelData} filename="日結紀錄.csv" >
              <Button variant="contained" css={styles.csvBtn} size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>日結紀錄</span>
              <Typography color="textSecondary" variant="body2">
                共 {dailyMoneyFlowResult.data.length} 筆
              </Typography>
            </div>
          }
        />
        <CardContent css={styles.content}>
          <TableContainer>
            <Table className="tableItem">
              <TableHead>
                <TableRow>
                  <TableCell css={styles.tableCell}>解除日結</TableCell>
                  <TableCell css={styles.tableCell}>營業日期</TableCell>
                  <TableCell css={styles.tableCell} className="cashSaving">現金結存</TableCell>
                  <TableCell css={styles.tableCell}>服務消費</TableCell>
                  <TableCell css={styles.tableCell}>店販消費</TableCell>
                  {isMemberShipCardActive && <TableCell css={styles.tableCell}>會員卡消費</TableCell>}
                  <TableCell css={styles.tableCell}>卡券使用(入業績)</TableCell>
                  <TableCell css={styles.tableCell}>卡券販賣(入業績)</TableCell>
                  <TableCell css={styles.tableCell}>業績收入</TableCell>
                  <TableCell css={styles.tableCell}>卡券販賣(不入業績)</TableCell>
                  <TableCell css={styles.tableCell}>入金儲值(不入業績)</TableCell>
                  <TableCell css={styles.tableCell}>卡券使用(-)</TableCell>
                  <TableCell css={styles.tableCell}>第三方卡券(-)</TableCell>
                  <TableCell css={styles.tableCell}>其他付款方式(-)</TableCell>
                  <TableCell css={styles.tableCell}>入金使用(-)</TableCell>
                  {bonusDisplay && <TableCell css={styles.tableCell}>點數折抵金額(-)</TableCell>}
                  <TableCell css={styles.tableCell} className="cashSaving">營業現金應收</TableCell>
                  <TableCell css={styles.tableCell}>現金收支收入</TableCell>
                  <TableCell css={styles.tableCell}>現金收支支出(-)</TableCell>
                  <TableCell css={styles.tableCell}>現金自購收入</TableCell>
                  <TableCell css={styles.tableCell}>最後結帳日期</TableCell>
                  <TableCell css={styles.tableCell}>結帳人</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyMoneyFlowResult.data.map(result => (
                  <TableRow key={result.date}>
                    <TableCell css={styles.tableCell}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          disableRestoreCheckout
                            ? handleOpenDialog(result.date)
                            : handleRestoreDailyAccount(result.date)
                        }
                        title="解除日結"
                      >
                        <LockOpenOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell css={styles.tableCell}>{format(new Date(result.date), 'yyyy/MM/dd')}</TableCell>
                    <TableCell css={styles.tableCell} className="cashSaving">
                      {Math.round(result.cashBalance)}
                    </TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.service)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.product)}</TableCell>
                    {isMemberShipCardActive && <TableCell css={styles.tableCell}>{Math.round(result.membership)}</TableCell>}
                    <TableCell css={styles.tableCell}>{roundDecimal(result.usedTicket)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.ticketSellIntoPerformance)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.performanceIncome)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.ticketSellNotIntoPerformance)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.walletDeposit)}</TableCell>
                    <TableCell css={styles.tableCell}>{roundDecimal(result.usedTicketForDecount)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.thirdPartTicketForDecount)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.otherPayWayForDecount)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.walletUsedForDecount)}</TableCell>
                    {bonusDisplay && <TableCell css={styles.tableCell}>{result.bonusDecountForReport}</TableCell>}
                    <TableCell css={styles.tableCell} className="cashSaving">{Math.round(result.businessCash)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.cashRevenue)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.cashExpenditure)}</TableCell>
                    <TableCell css={styles.tableCell}>{Math.round(result.picking)}</TableCell>
                    <TableCell css={styles.tableCell}>{format(result.lastCheckoutDateTime, 'yyyy/MM/dd')}</TableCell>
                    <TableCell css={styles.tableCell}>
                      {result.checkoutStaff === null ? '' : result.checkoutStaff.name}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell css={styles.tableCell} style={{ fontWeight: 'bold' }}>合計</TableCell>
                  <TableCell css={styles.tableCell} />
                  <TableCell css={styles.tableCell} className="cashSaving">
                    {Math.round(dailyMoneyFlowResult.summary.cashBalance)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>{Math.round(dailyMoneyFlowResult.summary.service)}</TableCell>
                  <TableCell css={styles.tableCell}>{Math.round(dailyMoneyFlowResult.summary.product)}</TableCell>
                  {isMemberShipCardActive && <TableCell css={styles.tableCell}>{Math.round(dailyMoneyFlowResult.summary.membership)}</TableCell>}
                  <TableCell css={styles.tableCell}>{Math.round(dailyMoneyFlowResult.summary.usedTicket)}</TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.ticketSellIntoPerformance)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.performanceIncome)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.ticketSellNotIntoPerformance)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.walletDeposit)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.usedTicketForDecount)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.thirdPartTicketForDecount)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.otherPayWayForDecount)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.walletUsedForDecount)}
                  </TableCell>
                  {bonusDisplay && <TableCell css={styles.tableCell}>{dailyMoneyFlowResult.summary.bonusDecountForReport}</TableCell>}
                  <TableCell css={styles.tableCell} className="cashSaving">
                    {Math.round(dailyMoneyFlowResult.summary.businessCash)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>{Math.round(dailyMoneyFlowResult.summary.cashRevenue)}</TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.cashExpenditure)}
                  </TableCell>
                  <TableCell css={styles.tableCell}>
                    {Math.round(dailyMoneyFlowResult.summary.picking)}
                  </TableCell>
                  <TableCell css={styles.tableCell} />
                  <TableCell css={styles.tableCell} />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
        {/* <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={dailyMoneyFlowResult.totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={dailyMoneyFlowResult.pageOffset}
            rowsPerPage={dailyMoneyFlowResult.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </CardActions> */}
      </Card>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{`${dateOnDialogTitle} 解除日結?`}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={restorePwd}
              label="密碼"
              onChange={event => setRestorePwd(event.target.value)}
              inputProps={{
                type: 'password',
                'data-testid': 'delete-password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button
            color="primary"
            autoFocus
            data-testid="confirm"
            onClick={handleRestoreDailyAccount}
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
