/** @jsxImportSource @emotion/react */
// 表格列使用 ui/table（外框 components/ManagementTable 亦為 ui/table）

import { Button } from 'ui/button'
import ManagementTable from 'components/ManagementTable'
import { TableBody, TableCell, TableHead, TableRow } from 'ui/table'
import idx from 'idx'
import format from 'date-fns/format'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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

function UsagedResult({ className, walletUseRecord, resultSetting, onChange, date, pagenationLabel, ...rest }) {
  const [excelData, setExcelData] = useState([])

  useEffect(() => {
    if (!walletUseRecord.loading) {
      const excelData = []
      const useRecords = idx(walletUseRecord.data, _ => _.walletUseRecord.record)
      useRecords.forEach(data => {
        excelData.push({
          '帳單編號/時間': `#${data.orderNo}-` + format(data.date, 'yyyy/MM/dd'),
          客戶: `${data.Customer.name}/${data.Customer.cellphone}`,
          設計師: `${data.Designer.name}` + `${data.Designer.designerNo ? ' / ' + data.designerNo : ''}`,
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
  }, [walletUseRecord.loading])
  return (
    <div {...rest} css={className}>
      <ManagementTable
        title="入金使用"
        totalCount={idx(walletUseRecord.data, _ => _.walletUseRecord.totalCount) || 0}
        pageLimit={resultSetting.usaged.pageLimit}
        pageOffset={resultSetting.usaged.pageOffset}
        onPageChange={(_event, page) =>
          onChange({ event: { target: { value: page } }, key: 'pageOffset' })
        }
        onRowsPerPageChange={event => onChange({ event, key: 'pageLimit' })}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={excelData}
        excelFilename="入金使用.csv"
        tableHead={(
          <>
            <TableHead css={styles.compactCell}>操作</TableHead>
            <TableHead css={styles.compactCell}>帳單編號/時間</TableHead>
            <TableHead css={styles.compactCell}>客戶</TableHead>
            <TableHead css={styles.compactCell}>設計師</TableHead>
            <TableHead css={styles.compactCell}>使用金額</TableHead>
          </>
        )}
      >
        <TableBody>
          {idx(walletUseRecord.data, _ =>
            _.walletUseRecord.record.map(data => (
              <TableRow key={`${data.id}-${data.index}`}>
                <TableCell css={styles.compactCell}>
                  <Button asChild size="sm" variant="secondary">
                    <RouterLink to={`/order/${data.order.id}`}>
                      訂單詳情
                    </RouterLink>
                  </Button>
                </TableCell>
                <TableCell css={styles.compactCell}>
                  {data.orderNo}
                  <div className="text-caption tabular-nums text-text-secondary">{format(data.date, 'yyyy/MM/dd')}</div>
                </TableCell>
                <TableCell css={styles.compactCell}>
                  {idx(data.Customer, _ => _.name)}
                  <div className="text-caption tabular-nums text-text-secondary">{idx(data.Customer, _ => _.cellphone)}</div>
                </TableCell>
                <TableCell css={styles.compactCell}>
                  {idx(
                    data.Designer,
                    _ => `${_.name}${_.designerNo ? ' / ' + _.designerNo : ''}`
                  )}
                </TableCell>
                <TableCell css={styles.compactCell}>{data.money}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow css={styles.fontWeight}>
            <TableCell css={styles.compactCell}>合計</TableCell>
            <TableCell css={styles.compactCell} colSpan={3} />
            <TableCell css={styles.compactCell}>
              {idx(walletUseRecord, _ =>
                _.data.walletUseRecord.record.reduce((prev, next) => prev + next.money, 0)
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div>
  )
}

UsagedResult.propTypes = {
  className: PropTypes.object
}

export default UsagedResult
