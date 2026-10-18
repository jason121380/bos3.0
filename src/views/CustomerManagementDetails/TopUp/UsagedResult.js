/** @jsxImportSource @emotion/react */
// TablePagination 保留 MUI：pagenationLabel 依賴 MUI 的 DOM class
import { TablePagination } from '@mui/material'
import TableEditBar from 'components/TableEditBar'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, pagenationLabel, ...rest }) {
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [pageRef.current, walletUseRecord])

  return (
    <div {...rest} css={className}>
      <p className="mb-2 text-label tabular-nums text-text-secondary">
        共 {idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount)} 筆資料,{' '}
        {resultSetting.usaged.pageOffset + 1}/
        {Math.ceil(
          idx(walletUseRecord.data, _ => _.walletUseRecord.record.length) /
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
                          訂單詳情
                        </RouterLink>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium tabular-nums">{data.orderNo}</div>
                      <div className="text-caption tabular-nums text-text-secondary">{format(data.date, 'MM/dd/yyyy')}</div>
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
        {/* 分頁保留 MUI：pageRef 交給 helper/pagenationLabel 改寫顯示文字 */}
        <div className="flex justify-end px-3 pb-2">
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
        </div>
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
