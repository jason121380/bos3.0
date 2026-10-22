import { Download, LockOpen } from 'lucide-react'
import { openSnackbar } from 'elements/snackbars'
import { format } from 'date-fns'
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import useFetchSetRestoreDailyAccount from 'hooks/useFetchSettingRestoreDailyAccount'
import idx from 'idx'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import { CSVLink } from "react-csv";
import roundDecimal from './../../helper/roundDecimal.js'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { formatNumber } from 'ui/format'
import { Field, Input } from 'ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

// 現金結存／營業現金應收欄位強調（舊版 .cashSaving）
const cash = 'bg-accent/8 font-medium text-accent'

function Results({
  className,
  dailyMoneyFlowResult,
  pageSetting,
  waitCloseOrderDateLoading,
  isMemberShipCardActive,
  bonusDisplay,
  ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [restorePwd, setRestorePwd] = useState('')
  const [dateForRestore, setDateForRestore] = useState(null)
  const [dateOnDialogTitle, setDateOnDialogTitle] = useState('')
  const [disableRestoreCheckout, setDisableRestoreCheckout] = useState(false)
  const passwordData = useFetchMerchantPassword()

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
    // 點數設定晚到時也要重算，否則表格有點數欄、匯出檔沒有（Jason 2026/10/22）
  }, [dailyMoneyFlowResult, isMemberShipCardActive, bonusDisplay])

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
    <div {...rest} className={className}>
      <Card>
        <CardHeader
          className="items-center pb-4"
          action={
            <Button asChild size="sm" variant="secondary">
              <CSVLink data={excelData} filename="日結紀錄.csv" >
                <Download strokeWidth={1.75} />
                報表匯出
              </CSVLink>
            </Button>
          }
        >
          <div className="flex items-baseline gap-3">
            <CardTitle>日結紀錄</CardTitle>
            <span className="text-label text-text-secondary tabular-nums">
              共 {dailyMoneyFlowResult.data.length} 筆
            </span>
          </div>
        </CardHeader>
        <div className="px-5 pb-5">
          <Table className="whitespace-nowrap">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>解除日結</TableHead>
                <TableHead>營業日期</TableHead>
                <TableHead numeric className="text-accent">現金結存</TableHead>
                <TableHead numeric>服務消費</TableHead>
                <TableHead numeric>店販消費</TableHead>
                {isMemberShipCardActive && <TableHead numeric>會員卡消費</TableHead>}
                <TableHead numeric>卡券使用(入業績)</TableHead>
                <TableHead numeric>卡券販賣(入業績)</TableHead>
                <TableHead numeric>業績收入</TableHead>
                <TableHead numeric>卡券販賣(不入業績)</TableHead>
                <TableHead numeric>入金儲值(不入業績)</TableHead>
                <TableHead numeric>卡券使用(-)</TableHead>
                <TableHead numeric>第三方卡券(-)</TableHead>
                <TableHead numeric>其他付款方式(-)</TableHead>
                <TableHead numeric>入金使用(-)</TableHead>
                {bonusDisplay && <TableHead numeric>點數折抵金額(-)</TableHead>}
                <TableHead numeric className="text-accent">營業現金應收</TableHead>
                <TableHead numeric>現金收支收入</TableHead>
                <TableHead numeric>現金收支支出(-)</TableHead>
                <TableHead numeric>現金自購收入</TableHead>
                <TableHead>最後結帳日期</TableHead>
                <TableHead>結帳人</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyMoneyFlowResult.data.map(result => (
                <TableRow key={result.date}>
                  <TableCell className="py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent"
                      onClick={() =>
                        disableRestoreCheckout
                          ? handleOpenDialog(result.date)
                          : handleRestoreDailyAccount(result.date)
                      }
                      title="解除日結"
                      aria-label="解除日結"
                    >
                      <LockOpen strokeWidth={1.75} />
                    </Button>
                  </TableCell>
                  <TableCell className="tabular-nums">{format(new Date(result.date), 'yyyy/MM/dd')}</TableCell>
                  <TableCell numeric className={cash}>
                    {formatNumber(Math.round(result.cashBalance))}
                  </TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.service))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.product))}</TableCell>
                  {isMemberShipCardActive && <TableCell numeric>{formatNumber(Math.round(result.membership))}</TableCell>}
                  <TableCell numeric>{formatNumber(roundDecimal(result.usedTicket))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.ticketSellIntoPerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.performanceIncome))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.ticketSellNotIntoPerformance))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.walletDeposit))}</TableCell>
                  <TableCell numeric>{formatNumber(roundDecimal(result.usedTicketForDecount))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.thirdPartTicketForDecount))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.otherPayWayForDecount))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.walletUsedForDecount))}</TableCell>
                  {bonusDisplay && <TableCell numeric>{formatNumber(result.bonusDecountForReport)}</TableCell>}
                  <TableCell numeric className={cash}>{formatNumber(Math.round(result.businessCash))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.cashRevenue))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.cashExpenditure))}</TableCell>
                  <TableCell numeric>{formatNumber(Math.round(result.picking))}</TableCell>
                  <TableCell className="tabular-nums">{format(result.lastCheckoutDateTime, 'yyyy/MM/dd')}</TableCell>
                  <TableCell>
                    {result.checkoutStaff === null ? '' : result.checkoutStaff.name}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-surface font-medium hover:bg-surface">
                <TableCell className="font-medium">合計</TableCell>
                <TableCell />
                <TableCell numeric className={cash}>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.cashBalance))}
                </TableCell>
                <TableCell numeric>{formatNumber(Math.round(dailyMoneyFlowResult.summary.service))}</TableCell>
                <TableCell numeric>{formatNumber(Math.round(dailyMoneyFlowResult.summary.product))}</TableCell>
                {isMemberShipCardActive && <TableCell numeric>{formatNumber(Math.round(dailyMoneyFlowResult.summary.membership))}</TableCell>}
                <TableCell numeric>{formatNumber(Math.round(dailyMoneyFlowResult.summary.usedTicket))}</TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.ticketSellIntoPerformance))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.performanceIncome))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.ticketSellNotIntoPerformance))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.walletDeposit))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.usedTicketForDecount))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.thirdPartTicketForDecount))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.otherPayWayForDecount))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.walletUsedForDecount))}
                </TableCell>
                {bonusDisplay && <TableCell numeric>{formatNumber(dailyMoneyFlowResult.summary.bonusDecountForReport)}</TableCell>}
                <TableCell numeric className={cash}>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.businessCash))}
                </TableCell>
                <TableCell numeric>{formatNumber(Math.round(dailyMoneyFlowResult.summary.cashRevenue))}</TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.cashExpenditure))}
                </TableCell>
                <TableCell numeric>
                  {formatNumber(Math.round(dailyMoneyFlowResult.summary.picking))}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
      <Dialog open={openDialog} onOpenChange={o => !o && handleCloseDialog()}>
        <DialogContent size="sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{`${dateOnDialogTitle} 解除日結?`}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field label="密碼" htmlFor="restore-checkout-password">
              <Input
                id="restore-checkout-password"
                type="password"
                value={restorePwd}
                onChange={event => setRestorePwd(event.target.value)}
                data-testid="delete-password"
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button
              variant="primary"
              autoFocus
              data-testid="confirm"
              onClick={handleRestoreDailyAccount}
            >
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.string,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
