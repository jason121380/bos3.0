// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）

import { Button } from 'ui/button'
import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import idx from 'idx'
import format from 'date-fns/format'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { CSVLink } from "react-csv"

function Results({ className, date, walletDepositRecord, onChange, resultSetting, pagenationLabel, ...rest }) {
  const history = useHistory()
  const [excelData, setExcelData] = useState([])

  const handleEdit = id => {
    history.push(`/topup/edit/${id}`)
  }
  // 回傳 unlisten：原本離開此頁後監聽仍在，每來一次就多一個，返回時會重複 history.go(1)
  useEffect(() => history.listen((newLocation, action) => {
    if (action === 'POP' && newLocation.pathname.match('/topup/edit')) {
      history.go(1)
    }
  }), [])

  useEffect(() => {
    if (!walletDepositRecord.loading) {
      const excelData = []
      const recordData = idx(walletDepositRecord.data, _ => _.walletDepositRecord.record)
      recordData.forEach(record => {
        excelData.push({
          日期: format(record.date, 'yyyy/MM/dd'),
          '客戶(編號)': `${record.Customer.name}${record.Customer.no ? `(${record.Customer.no})` : ''
            }/${record.Customer.cellphone}`,
          實際付款金額: record.handlingFeeDecountWay === 'BYCUSTOMER'
            ? record.money + Math.abs(record.handlingFeeDecountPrice)
            : record.money,
          入金金額: record.money,
          設計師: `${record.Maker.name}/${record.Maker.designerNo ? record.Maker.designerNo : ''}`,
          付款方式: record.payType,
          入金儲值手續費負擔方: record.handlingFeeDecountWay === 'BYDESIGNER' ? '由設計師負擔'
            : record.handlingFeeDecountWay === 'BYCUSTOMER' ? '由客人負擔' : '不扣項',
          入金儲值手續費: record.handlingFeeDecountPrice,
          備註: record.remark,
        })
      })

      let total = 0
      recordData.map(record => {
        if (record.handlingFeeDecountWay === 'BYCUSTOMER') {
          total += record.money + Math.abs(record.handlingFeeDecountPrice)
        } else {
          total += record.money
        }
      })

      excelData.push({
        日期: '合計',
        '客戶(編號)': '',
        實際付款金額: total,
        入金金額: recordData.reduce((prev, next) => prev + next.money, 0),
        設計師: '',
        付款方式: '',
        入金儲值手續費負擔方: '',
        入金儲值手續費: recordData.reduce((prev, next) => prev + next.handlingFeeDecountPrice, 0),
        備註: '',
      })

      setExcelData(excelData)
    }
  }, [walletDepositRecord.loading])
  let total = 0
  if (walletDepositRecord != undefined) {
    idx(walletDepositRecord.data, _ =>
      _.walletDepositRecord.record.map(record => {
        if (record.handlingFeeDecountWay === 'BYCUSTOMER') {
          total += record.money + Math.abs(record.handlingFeeDecountPrice)
        } else {
          total += record.money
        }
      })
    )
  }

  return (
    <div {...rest} className={className}>
      <ManagementTable
        title="入金紀錄"
        totalCount={idx(walletDepositRecord.data, _ => _.walletDepositRecord.totalCount) || 0}
        pageLimit={resultSetting.record.pageLimit}
        pageOffset={resultSetting.record.pageOffset}
        onPageChange={(_event, page) =>
          onChange({ event: { target: { value: page } }, key: 'pageOffset' })
        }
        onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={excelData}
        excelFilename="入金紀錄.csv"
        tableHead={(
          <>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">操作</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">日期</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">客戶</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">實際付款金額</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">入金金額</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">設計師</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">付款方式</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">手續費負擔方</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">手續費</TableHead>
            <TableHead className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">備註</TableHead>
          </>
        )}
      >
        <TableBody>
          {idx(walletDepositRecord.data, _ =>
            _.walletDepositRecord.record.map(record => (
              <TableRow key={record.id}>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(record.id)}
                  >
                    編輯
                  </Button>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{format(record.date, 'yyyy/MM/dd')}</TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {record.Customer.name}
                  <div className="text-caption tabular-nums text-text-secondary">
                    {record.Customer.no ? `(${record.Customer.no})` : ''}
                  </div>
                  <div className="text-caption tabular-nums text-text-secondary">{record.Customer.cellphone}</div>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {record.handlingFeeDecountWay === 'BYCUSTOMER'
                    ? record.money + Math.abs(record.handlingFeeDecountPrice)
                    : record.money}
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{record.money}</TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {record.Maker.name}
                  <div className="text-caption tabular-nums text-text-secondary">
                    {record.Maker.designerNo ? record.Maker.designerNo : ''}
                  </div>
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{record.payType}</TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
                  {record.handlingFeeDecountWay === 'BYDESIGNER'
                    ? '由設計師負擔'
                    : record.handlingFeeDecountWay === 'BYCUSTOMER'
                      ? '由客人負擔'
                      : '不扣項'}
                </TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{record.handlingFeeDecountPrice}</TableCell>
                <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{record.remark}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow className="!font-bold">
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap" colSpan={2}>合計</TableCell>
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap" />
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">{total}</TableCell>
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
              {idx(walletDepositRecord, _ =>
                _.data.walletDepositRecord.record.reduce(
                  (prev, next) => prev + next.money,
                  0
                )
              )}
            </TableCell>
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap" colSpan={3} />
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap">
              {idx(walletDepositRecord, _ =>
                _.data.walletDepositRecord.record.reduce(
                  (prev, next) => prev + next.handlingFeeDecountPrice,
                  0
                )
              )}
            </TableCell>
            <TableCell className="!px-[8px] !py-[4px] ![font-size:13px] whitespace-nowrap" />
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div>
  )
}

export default Results
