import clsx from 'clsx'
// 分頁使用 ui/table TablePagination（paginationLabel 找不到 MUI class 即不動作，ui 版自帶中文筆數文字）
import { Plus } from 'lucide-react'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useHistory } from 'react-router'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

function Results({
  className,
  date,
  walletDepositRecord,
  onChange,
  resultSetting,
  walletBalance,
  paginationLabel,
  ...rest
}) {
  const history = useHistory()
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      paginationLabel(pageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（paginationLabel）；只在 [pageRef.current, walletDepositRecord] 變動時呼叫，補上會每次 render 重跑
  }, [pageRef.current, walletDepositRecord])

  const handleAddWalletClick = () => {
    history.push('/topup/create')
  }

  return (
    <div {...rest} className={clsx('flex flex-col gap-4', className)}>
      <Card className="flex flex-col items-center gap-1 px-5 py-6 text-center">
        <span className="text-label text-text-secondary">
          入金餘額
        </span>
        <span className="text-display tabular-nums text-text">{formatNumber(walletBalance)}</span>
      </Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label tabular-nums text-text-secondary">
          共 {idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount)} 筆資料,
          {resultSetting.record.pageOffset + 1}/
          {Math.ceil(
            idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount) /
            resultSetting.record.pageLimit
          )}
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddWalletClick}
        >
          <Plus strokeWidth={1.75} />
          新增入金
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>入金紀錄</CardTitle>
        </CardHeader>
        <div className="px-5">
          <Table className="min-w-[800px]">
            {/* head */}
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>操作</TableHead>

                <TableHead>日期</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead numeric>實際付款金額</TableHead>
                <TableHead numeric>入金金額</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead>付款方式</TableHead>
                <TableHead>入金儲值手續費負擔方</TableHead>
                <TableHead numeric>入金儲值手續費</TableHead>
                <TableHead>備註</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {idx(walletDepositRecord.data, _ =>
                _.walletDepositRecord.record.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Button asChild size="sm" variant="secondary">
                        <RouterLink to={`/topup/edit/${record.id}`}>
                          編輯
                        </RouterLink>
                      </Button>
                    </TableCell>
                    <TableCell className="tabular-nums">{format(record.date, 'yyyy/MM/dd')}</TableCell>
                    <TableCell>
                      {record.Customer.name}
                      <div className="text-caption tabular-nums text-text-secondary">{record.Customer.cellphone}</div>
                    </TableCell>
                    <TableCell numeric>
                      {formatNumber(record.handlingFeeDecountWay === 'BYCUSTOMER'
                        ? record.money + Math.abs(record.handlingFeeDecountPrice)
                        : record.money)}
                    </TableCell>
                    <TableCell numeric>{formatNumber(record.money)}</TableCell>
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
                    <TableCell numeric>{formatNumber(record.handlingFeeDecountPrice)}</TableCell>
                    <TableCell>{record.remark}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-surface hover:bg-surface">
                <TableCell className="font-bold">合計</TableCell>
                <TableCell colSpan={3} />
                <TableCell numeric className="font-bold">
                  {formatNumber(idx(walletDepositRecord, _ =>
                    _.data.walletDepositRecord.record.reduce(
                      (prev, next) => prev + next.money,
                      0
                    )
                  ))}
                </TableCell>
                <TableCell colSpan={5}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end px-3 pb-2">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            count={walletDepositRecord.data === undefined ? 0 : idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount)}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.record.pageOffset}
            rowsPerPage={resultSetting.record.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
      <TableEditBar />
    </div>
  )
}

export default Results
