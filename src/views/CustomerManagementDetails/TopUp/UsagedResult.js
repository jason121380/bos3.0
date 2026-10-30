// 分頁使用 ui/table TablePagination（pagenationLabel 找不到 MUI class 即不動作，ui 版自帶中文筆數文字）
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from 'ui/table'

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, pagenationLabel, ...rest }) {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（pagenationLabel）；只在 [pageRef.current, walletUseRecord] 變動時呼叫，補上會每次 render 重跑
  }, [pageRef.current, walletUseRecord])

  return (
    <div {...rest} className={className}>
      <p className="mb-2 text-label tabular-nums text-text-secondary">
        共 {idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)} 筆資料,{' '}
        {resultSetting.usaged.pageOffset + 1}/
        {/* 總頁數以總筆數計算（原本用本頁筆數 record.length；Jason 2026/10/22 fix all） */}
        {Math.ceil(
          (idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount) || 0) /
          resultSetting.usaged.pageLimit
        )}
      </p>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>入金使用</CardTitle>
        </CardHeader>
        <div className="px-5">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>操作</TableHead>
                <TableHead>帳單編號/時間</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>設計師</TableHead>
                <TableHead numeric>使用金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {idx(walletUseRecord.data, _ =>
                _.walletUseRecord.record.map((data, index) => (
                  <TableRow key={`${data.id}-${data.index}`}>
                    <TableCell>
                      <Button asChild size="sm" variant="secondary">
                        <RouterLink to={`/order/${data.order.id}`}>
                          帳單詳情
                        </RouterLink>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium tabular-nums">{data.orderNo}</div>
                      <div className="text-caption tabular-nums text-text-secondary">{format(data.date, 'yyyy/MM/dd')}</div>
                    </TableCell>
                    <TableCell>
                      {idx(data.Customer, _ => _.name)}
                      <div className="text-caption tabular-nums text-text-secondary">{idx(data.Customer, _ => _.cellphone)}</div>
                    </TableCell>
                    <TableCell>
                      {idx(
                        data.Designer,
                        _ => `${_.name} ${_.designerNo ? ' / ' + _.designerNo : ''}`
                      )}
                    </TableCell>
                    <TableCell numeric>{formatNumber(data.money)}</TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-surface hover:bg-surface">
                <TableCell colSpan={3}></TableCell>
                <TableCell className="font-bold">合計</TableCell>
                <TableCell numeric className="font-bold">
                  {formatNumber(idx(walletUseRecord, _ =>
                    _.data.walletUseRecord.record.reduce((prev, next) => prev + next.money, 0)
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end px-3 pb-2">
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            count={walletUseRecord.data === undefined ? 0 : idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)}
            onPageChange={(_event, page) =>
              onChange({ event: { target: { value: page } }, key: 'pageOffset' })
            }
            onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
            page={resultSetting.usaged.pageOffset}
            rowsPerPage={resultSetting.usaged.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 50, 1000]}
          />
        </div>
      </Card>
      <TableEditBar />
    </div>
  )
}

UsagedResult.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
}

UsagedResult.defaultProps = {
  customers: [],
}

export default UsagedResult
