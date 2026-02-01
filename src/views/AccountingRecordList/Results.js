/** @jsxImportSource @emotion/react */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { format } from 'date-fns'
import useFetchMoneyFlowReportExcel from 'hooks/useFetchMoneyFlowReportExcel'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Link as RouterLink } from 'react-router-dom'
import { CSVLink } from "react-csv";
import pagenationLabel from './../../helper/pagenationLabel'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  filterButton: css({
    marginRight: theme.spacing(2),
  }),
  content: css({
    padding: '0px !important',
  }),
  inner: css({
    minWidth: 1300,
  }),
  actions: css({
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
  }),
  sticky1: css({
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
  }),
  sticky2: css({
    position: 'sticky',
    left: "74px",
    background: 'white',
    zIndex: '99',
  }),
}

function Results({
  className,
  onPageChange,
  onRowsPerPageChange,
  moneyFlows,
  pageSetting,
  ...rest
}) {
  const [excelData, setExcelData] = useState([])
  const pageRef = useRef(null)

  const { fetchMoneyFlowReportExcel, response } = useFetchMoneyFlowReportExcel({
    input: {
      startDate: pageSetting.startDate,
      endDate: pageSetting.endDate,
    },
  })

  const handleMenuItem = () => {
    fetchMoneyFlowReportExcel()
  }

  useEffect(() => {
    if (response.data) {
      window.location.href = response.data.moneyFlowReportExcel
    }
  }, [response])

  useEffect(() => {
    const excelData = []
    moneyFlows.moneyFlows.forEach(data => {
      excelData.push({
        日期: format(data.date, 'yyyy-MM-dd'),
        科目名稱: data.accountingSubject !== null ? data.accountingSubject.name : '',
        收入: data.inoutType === 'REVENUE' ? data.amount : '',
        支出: data.inoutType === 'EXPENDITURE' ? data.amount : '',
        登錄者: data.user ? `${data.user.name}/${data.user.designerNo || ''}` : '',
        收付方式: data.walletType,
        關係人: data.relationUser === null ? '' : data.relationUser.name,
        備註: data.remark,
      })
    })
    setExcelData(excelData)
    if (pageRef.current) {
      pagenationLabel(pageRef.current)
    }
  }, [moneyFlows, pageRef.current])

  if (!moneyFlows) {
    return 'Loading...'
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <Typography color="textSecondary" gutterBottom variant="body2">
        共 {moneyFlows.totalCount} 筆, {moneyFlows.pageOffset + 1} /{' '}
        {Math.ceil(moneyFlows.totalCount / moneyFlows.pageLimit)}
      </Typography>
      <Card>
        <CardHeader
          action={
            <CSVLink data={excelData} filename="高階收支登錄.csv" >
              <Button variant="contained" color="primary" size="small">
                報表匯出
              </Button>
            </CSVLink>
          }
          title="高階收支登錄"
        />
        <Divider />
        <CardContent css={styles.content}>
          <PerfectScrollbar>
            <div css={styles.inner}>
              <Table className='AccountingRecordListTable'>
                <TableHead>
                  <TableRow>
                    <TableCell css={styles.sticky1} style={{ width: '74px' }}>操作</TableCell>
                    <TableCell css={styles.sticky2} style={{ width: '85px' }}>日期</TableCell>
                    <TableCell>科目名稱</TableCell>
                    <TableCell>收入</TableCell>
                    <TableCell>支出</TableCell>
                    <TableCell>登錄者</TableCell>
                    <TableCell>收付方式</TableCell>
                    <TableCell>關係人</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moneyFlows.moneyFlows.map((data, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell css={styles.sticky1} >
                          <Button
                            color="primary"
                            component={RouterLink}
                            size="small"
                            to={`/accounting/deatil/${data.id}`}
                            variant="outlined"
                          >
                            修改
                          </Button>
                        </TableCell>
                        <TableCell css={styles.sticky2}>{format(data.date, 'yyyy-MM-dd')}</TableCell>
                        <TableCell>
                          {data.accountingSubject !== null ? data.accountingSubject.name : ''}
                        </TableCell>
                        <TableCell>{data.inoutType === 'REVENUE' ? data.amount : ''}</TableCell>
                        <TableCell>{data.inoutType === 'EXPENDITURE' ? data.amount : ''}</TableCell>
                        <TableCell>
                          {data.user ? `${data.user.name}/${data.user.designerNo || ''}` : ''}
                        </TableCell>
                        <TableCell>{data.walletType}</TableCell>
                        <TableCell>
                          {data.relationUser === null ? '' : data.relationUser.name}
                        </TableCell>
                        <TableCell>{data.remark}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </PerfectScrollbar>
        </CardContent>
        <CardActions css={styles.actions}>
          <TablePagination
            ref={pageRef}
            labelRowsPerPage='每頁顯示數量'
            component="div"
            count={moneyFlows.totalCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={moneyFlows.pageOffset}
            rowsPerPage={moneyFlows.pageLimit}
            rowsPerPageOptions={[5, 10, 25, 100, 250, 500, 1000]}
          />
        </CardActions>
      </Card>
    </div>
  )
}

Results.propTypes = {
  css: PropTypes.object,
  orders: PropTypes.array,
}

Results.defaultProps = {
  orders: [],
}

export default Results
