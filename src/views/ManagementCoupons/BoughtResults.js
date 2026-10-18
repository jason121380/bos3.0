/** @jsxImportSource @emotion/react */
// 表格列保留 MUI TableBody / TableRow / TableCell：外框為共用元件 components/ManagementTable（MUI Table）
import {
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import ManagementTable from 'components/ManagementTable'
import { format } from 'date-fns'
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
    padding: '0px !important',
  }),
  inner: css({
    minWidth: 1150,
  }),
  actions: css({
    padding: theme.spacing(0, 1) + '!important',
    justifyContent: 'flex-end',
  }),
  cardHeader: css({
    '& .MuiCardHeader-action': {
      marginTop: 0
    }
  }),
  fontWeight: css({
    '& td': {
      fontWeight: 'bold'
    }
  }),
  compactCell: css({
    padding: '4px 8px !important',
  }),
}

export default function BoughtResults({
  className,
  results,
  page,
  onChangePage,
  onChangeRowsPerPage,
  pagenationLabel,
  roundDecimal,
  ...rest
}) {
  const { pageOffset, pageLimit } = page
  const [csvData, setCsvData] = useState([])
  const [reportData, setReportData] = useState([])
  const pageRef = useRef(null)

  const handleCountTotal = key => {
    if (key === 'price') {
      return roundDecimal(reportData.reduce((acc, cur) => acc + roundDecimal(cur.price), 0))
    } else {
      return reportData.reduce((acc, cur) => acc + cur[key], 0)
    }
  }

  useEffect(() => {
    setReportData(results.slice(pageOffset * pageLimit, (pageOffset * pageLimit) + pageLimit))
  }, [results, page])

  useEffect(() => {
    const csvData = []
    reportData.forEach(data => {
      csvData.push({
        '帳單編號/時間': `#${data.orderNo}_${format(data.orderDate, 'yyyy/MM/dd')}`,
        '客戶': `${data.customerName} ${data.customerPhone}`,
        '設計師': `${data.designerName} ${data.designerNo}`,
        '卡券代號': `${data.ticketNo}`,
        '卡券販賣': `${data.ticketName}`,
        '卡券販賣金額': `${roundDecimal(data.price)}`,
        '總張數': `${data.totalCount}`,
        '剩餘張數': `${data.leftCount}`
      })
    });
    csvData.push({
      '帳單編號/時間': '',
      '客戶': '',
      '設計師': '',
      '卡券代號': '',
      '卡券販賣': '合計',
      '卡券販賣金額': `${handleCountTotal('price')}`,
      '總張數': `${handleCountTotal('totalCount')}`,
      '剩餘張數': `${handleCountTotal('leftCount')}`
    })
    setCsvData(csvData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [reportData, pageRef.current])


  return (
    <div {...rest} css={css([styles.root, className])}>
      <ManagementTable
        title="卡券販賣紀錄"
        totalCount={results.length}
        pageLimit={pageLimit}
        pageOffset={pageOffset}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 1000]}
        excelData={csvData}
        excelFilename="卡券販賣紀錄.csv"
        tableHead={(
          <>
            <TableCell css={styles.compactCell}>操作</TableCell>
            <TableCell css={styles.compactCell}>帳單編號/時間</TableCell>
            <TableCell css={styles.compactCell}>客戶</TableCell>
            <TableCell css={styles.compactCell}>設計師</TableCell>
            <TableCell css={styles.compactCell}>卡券代號</TableCell>
            <TableCell css={styles.compactCell}>卡券販賣</TableCell>
            <TableCell css={styles.compactCell}>金額</TableCell>
            <TableCell css={styles.compactCell}>總張數</TableCell>
            <TableCell css={styles.compactCell}>現餘</TableCell>
          </>
        )}
      >
        <TableBody>
          {reportData.map((data, index) => (
            <TableRow hover key={`${data.id}-${index}`}>
              <TableCell css={styles.compactCell}>
                <Button asChild size="sm" variant="secondary">
                  <RouterLink to={`/order/${data.orderId}`}>
                    詳情
                  </RouterLink>
                </Button>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {data.orderNo}
                <div className="text-caption tabular-nums text-text-secondary">
                  {format(data.orderDate, 'yyyy/MM/dd')}
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {data.customerName}
                <div className="text-caption tabular-nums text-text-secondary">
                  {data.customerPhone}
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>
                {data.designerName}
                <div className="text-caption tabular-nums text-text-secondary">
                  {data.designerNo}
                </div>
              </TableCell>
              <TableCell css={styles.compactCell}>{data.ticketNo}</TableCell>
              <TableCell css={styles.compactCell}>{data.ticketName}</TableCell>
              <TableCell css={styles.compactCell}>{roundDecimal(data.price)}</TableCell>
              <TableCell css={styles.compactCell}>{data.totalCount}</TableCell>
              <TableCell css={styles.compactCell}>{data.leftCount}</TableCell>
            </TableRow>
          ))}
          <TableRow css={styles.fontWeight}>
            <TableCell css={styles.compactCell} colSpan={5} />
            <TableCell css={styles.compactCell}>合計</TableCell>
            <TableCell css={styles.compactCell}>{handleCountTotal('price')}</TableCell>
            <TableCell css={styles.compactCell}>{handleCountTotal('totalCount')}</TableCell>
            <TableCell css={styles.compactCell}>{handleCountTotal('leftCount')}</TableCell>
          </TableRow>
        </TableBody>
      </ManagementTable>
    </div >
  )
}
