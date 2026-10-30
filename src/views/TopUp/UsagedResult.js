// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）

import { Button } from 'ui/button'
import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from 'react-csv'
import { maskCustomerName, maskCellphone } from 'helper/exportCustomerMask'

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, paginationLabel, isCustomerDataMarked, ...rest }) {
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    if (!walletUseRecord.loading) {
      const excelData = []
      // 查詢失敗時以空陣列處理（原本 forEach 拋錯整頁錯誤；Jason 2026/10/22 fix all）
      const useRecords = idx(walletUseRecord.data, _ => _.walletUseRecord.record) || []
      useRecords.forEach(data => {
        excelData.push({
          '帳單編號/時間': `#${data.orderNo}-` + format(data.date, 'yyyy/MM/dd'),
          // 匯出檔依設定遮罩姓名與手機（比照帳單列表；Jason 2026/10/22 同意）
          客戶:
            isCustomerDataMarked !== false
              ? `${maskCustomerName(data.Customer.name)}/${maskCellphone(data.Customer.cellphone)}`
              : `${data.Customer.name}/${data.Customer.cellphone}`,
          // 設計師代號讀 Designer.designerNo（原本讀不存在的 data.designerNo 匯出 undefined；Jason 2026/10/22 fix all）
          設計師: `${data.Designer.name}` + `${data.Designer.designerNo ? ' / ' + data.Designer.designerNo : ''}`,
          使用金額: data.money,
        })
      })
      excelData.push({
        '帳單編號/時間': '合計',
        客戶: '',
        設計師: '',
        使用金額: useRecords.reduce((prev, next) => prev + next.money, 0),
      })
      setExcelData(excelData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [walletUseRecord.loading, isCustomerDataMarked])
  return (
    <div {...rest} className={className}>
      <ManagementTable
        title="入金使用"
        totalCount={idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount) || 0}
        pageLimit={resultSetting.usaged.pageLimit}
        pageOffset={resultSetting.usaged.pageOffset}
        onPageChange={(_event, page) => onChange({ event: { target: { value: page } }, key: 'pageOffset' })}
        onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={excelData}
        excelFilename="入金使用.csv"
        tableHead={
          <>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">操作</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">帳單編號/時間</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">客戶</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">設計師</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">使用金額</TableHead>
          </>
        }
      >
        <TableBody>
          {idx(walletUseRecord.data, _ =>
            _.walletUseRecord.record.map(data => (
              <TableRow key={`${data.id}-${data.index}`}>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  <Button asChild size="sm" variant="secondary">
                    <RouterLink to={`/order/${data.order.id}`}>帳單詳情</RouterLink>
                  </Button>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {data.orderNo}
                  <div className="text-caption tabular-nums text-text-secondary">{format(data.date, 'yyyy/MM/dd')}</div>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {idx(data.Customer, _ => _.name)}
                  <div className="text-caption tabular-nums text-text-secondary">{idx(data.Customer, _ => _.cellphone)}</div>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {idx(data.Designer, _ => `${_.name}${_.designerNo ? ' / ' + _.designerNo : ''}`)}
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{data.money}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow className="!font-bold">
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">合計</TableCell>
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap" colSpan={3} />
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
              {idx(walletUseRecord, _ => _.data.walletUseRecord.record.reduce((prev, next) => prev + next.money, 0))}
            </TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div>
  )
}

UsagedResult.propTypes = {
  className: PropTypes.string,
}

export default UsagedResult
