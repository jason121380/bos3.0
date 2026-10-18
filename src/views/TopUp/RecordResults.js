/** @jsxImportSource @emotion/react */
// 表格列保留 MUI TableBody / TableRow / TableCell：外框為共用元件 components/ManagementTable（MUI Table）
import {
  TableBody, TableCell, TableRow
} from '@mui/material'
import { Button } from 'ui/button'
import ManagementTable from 'components/ManagementTable'
import idx from 'idx'
import format from 'date-fns/format'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { CSVLink } from "react-csv"
import { css } from '@emotion/react'

const styles = {
  compactCell: css({
    padding: '4px 8px !important',
    fontSize: '13px !important',
    whiteSpace: 'nowrap',
  }),
  fontWeight: css({
    fontWeight: 'bold !important',
  }),
}

function Results({ className, date, walletDepositRecord, onChange, resultSetting, pagenationLabel, ...rest }) {
  const history = useHistory()
  const [excelData, setExcelData] = useState([])

  const handleEdit = id => {
    history.push(`/topup/edit/${id}`)
  }
  useEffect(() => {
    history.listen((newLocation, action) => {
      if (action === 'POP' && newLocation.pathname.match('/topup/edit')) {
        history.go(1)
      }
    })
  }, [])

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
    <div {...rest} css={className}>
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
            <TableCell css={styles.compactCell}>操作</TableCell>
            <TableCell css={styles.compactCell}>日期</TableCell>
            <TableCell css={styles.compactCell}>客戶</TableCell>
            <TableCell css={styles.compactCell}>實際付款金額</TableCell>
            <TableCell css={styles.compactCell}>入金金額</TableCell>
            <TableCell css={styles.compactCell}>設計師</TableCell>
            <TableCell css={styles.compactCell}>付款方式</TableCell>
            <TableCell css={styles.compactCell}>手續費負擔方</TableCell>
            <TableCell css={styles.compactCell}>手續費</TableCell>
            <TableCell css={styles.compactCell}>備註</TableCell>
          </>
        )}
      >
        <TableBody>
          {idx(walletDepositRecord.data, _ =>
            _.walletDepositRecord.record.map(record => (
              <TableRow hover key={record.id}>
                <TableCell css={styles.compactCell}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(record.id)}
                  >
                    編輯
                  </Button>
                </TableCell>
                <TableCell css={styles.compactCell}>{format(record.date, 'yyyy/MM/dd')}</TableCell>
                <TableCell css={styles.compactCell}>
                  {record.Customer.name}
                  <div className="text-caption tabular-nums text-text-secondary">
                    {record.Customer.no ? `(${record.Customer.no})` : ''}
                  </div>
                  <div className="text-caption tabular-nums text-text-secondary">{record.Customer.cellphone}</div>
                </TableCell>
                <TableCell css={styles.compactCell}>
                  {record.handlingFeeDecountWay === 'BYCUSTOMER'
                    ? record.money + Math.abs(record.handlingFeeDecountPrice)
                    : record.money}
                </TableCell>
                <TableCell css={styles.compactCell}>{record.money}</TableCell>
                <TableCell css={styles.compactCell}>
                  {record.Maker.name}
                  <div className="text-caption tabular-nums text-text-secondary">
                    {record.Maker.designerNo ? record.Maker.designerNo : ''}
                  </div>
                </TableCell>
                <TableCell css={styles.compactCell}>{record.payType}</TableCell>
                <TableCell css={styles.compactCell}>
                  {record.handlingFeeDecountWay === 'BYDESIGNER'
                    ? '由設計師負擔'
                    : record.handlingFeeDecountWay === 'BYCUSTOMER'
                      ? '由客人負擔'
                      : '不扣項'}
                </TableCell>
                <TableCell css={styles.compactCell}>{record.handlingFeeDecountPrice}</TableCell>
                <TableCell css={styles.compactCell}>{record.remark}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow css={styles.fontWeight}>
            <TableCell css={styles.compactCell} colSpan={2}>合計</TableCell>
            <TableCell css={styles.compactCell} />
            <TableCell css={styles.compactCell}>{total}</TableCell>
            <TableCell css={styles.compactCell}>
              {idx(walletDepositRecord, _ =>
                _.data.walletDepositRecord.record.reduce(
                  (prev, next) => prev + next.money,
                  0
                )
              )}
            </TableCell>
            <TableCell css={styles.compactCell} colSpan={3} />
            <TableCell css={styles.compactCell}>
              {idx(walletDepositRecord, _ =>
                _.data.walletDepositRecord.record.reduce(
                  (prev, next) => prev + next.handlingFeeDecountPrice,
                  0
                )
              )}
            </TableCell>
            <TableCell css={styles.compactCell} />
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div>
  )
}

export default Results
