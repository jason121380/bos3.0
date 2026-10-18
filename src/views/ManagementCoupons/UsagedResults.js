/** @jsxImportSource @emotion/react */
// 表格列保留 MUI TableBody / TableRow / TableCell：外框為共用元件 components/ManagementTable（MUI Table）
import {
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import ManagementTable from 'components/ManagementTable'
import idx from 'idx'
import format from 'date-fns/format'
import { useState, useEffect, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Button } from 'ui/button'

const styles = {
  root: css({}),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: 0,
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-action': {
      marginTop: 0
    }
  }),
  compactCell: css({
    padding: '4px 8px !important',
  }),
}

export default function UsagedResults({
  orders,
  employees,
  onChangePage,
  onChangeRowsPerPage,
  page,
  results,
  pagenationLabel,
  roundDecimal,
  ...rest
}) {
  const pageRef = useRef(null)
  const [csvData, setCsvData] = useState([])
  const totalPrice = () => {
    const price = results.reduce((acc, cur) => acc + roundDecimal(cur.price), 0)
    return roundDecimal(price)
  }

  useEffect(() => {
    const csvData = []
    results.forEach(data => {
      csvData.push({
        '使用卡券之帳單編號/時間': `#${data.usageOrder.no}_${format(data.usageOrder.date, 'yyyy/MM/dd')}`,
        '購買卡券之帳單編號/時間': `#${data.order.no}_${format(data.order.date, 'yyyy/MM/dd')}`,
        '客戶': `${data.order.customer.name} ${data.order.customer.cellphone}`,
        '設計師': `${data.order.designer.name} ${data.order.designer.designerNo}`,
        '卡券代號': `${data.no}`,
        '卡券使用': `${data.service.name}`,
        '卡券使用金額': `${roundDecimal(data.price)}`
      })
    });
    csvData.push({
      '使用卡券之帳單編號/時間': '',
      '購買卡券之帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券使用': '合計',
      '卡券使用金額': totalPrice()
    })
    setCsvData(csvData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [results, pageRef.current])

  return (
    <div {...rest} css={styles.root}>
      <ManagementTable
        title="卡券使用紀錄"
        totalCount={page.count}
        pageLimit={page.limit}
        pageOffset={page.offset}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={csvData}
        excelFilename="卡券使用紀錄.csv"
        tableHead={(
          <>
            <TableCell css={styles.compactCell}>使用詳情</TableCell>
            <TableCell css={styles.compactCell}>購買詳情</TableCell>
            <TableCell css={styles.compactCell}>客戶</TableCell>
            <TableCell css={styles.compactCell}>設計師</TableCell>
            <TableCell css={styles.compactCell}>卡券代號</TableCell>
            <TableCell css={styles.compactCell}>卡券使用</TableCell>
            <TableCell css={styles.compactCell}>金額</TableCell>
          </>
        )}
      >
        <TableBody>
          {results.map((result, index) => (
            <TableRow hover key={`${result.id}-${index}`}>
              <TableCell css={styles.compactCell}>
                {idx(result, _ => _.usageOrder.no)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => format(_.usageOrder.date, 'yyyy/MM/dd'))}
                </div>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${result.usageOrder.id}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {idx(result, _ => _.order.no)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => format(_.order.date, 'yyyy/MM/dd'))}
                </div>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${result.order.id}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {idx(result, _ => _.order.customer.name)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => _.order.customer.cellphone)}
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {idx(result, _ => _.usageOrder.designer.name)}
                <div className="text-caption tabular-nums text-text-secondary">
                  {idx(result, _ => _.usageOrder.designer.designerNo)}
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>{idx(result, _ => _.no)}</TableCell>
              <TableCell css={styles.compactCell}>{idx(result, _ => _.service.name)}</TableCell>
              <TableCell css={styles.compactCell}>{roundDecimal(idx(result, _ => _.price))}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell css={styles.compactCell} colSpan={5} />
            <TableCell css={styles.compactCell} style={{ fontWeight: 'bold' }}>合計</TableCell>
            <TableCell css={styles.compactCell} style={{ fontWeight: 'bold' }}>{totalPrice()}</TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div >
  )
}
