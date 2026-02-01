/** @jsxImportSource @emotion/react */
import {
  Button,
  Divider,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material'
import { format } from 'date-fns'
import useFetchMoneyFlowReportExcel from 'hooks/useFetchMoneyFlowReportExcel'
import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { theme } from '../../theme'
import { css } from '@emotion/react'
import ManagementTable from 'components/ManagementTable'

const styles = {
  root: css({}),
  sticky1: css({
    position: 'sticky',
    left: 0,
    background: '#ffffff !important',
    zIndex: '99',
  }),
  sticky2: css({
    position: 'sticky',
    left: "74px",
    background: '#ffffff !important',
    zIndex: '99',
  }),
  tableRow: css({
    backgroundColor: '#ffffff !important',
    '&:hover': {
      backgroundColor: '#ffffff !important',
    },
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
  }, [moneyFlows])

  if (!moneyFlows) {
    return 'Loading...'
  }

  return (
    <div {...rest} css={css([styles.root, className])}>
      <ManagementTable
        title="高階收支登錄"
        totalCount={moneyFlows.totalCount}
        excelData={excelData}
        excelFilename="高階收支登錄.csv"
        pageLimit={moneyFlows.pageLimit}
        pageOffset={moneyFlows.pageOffset}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 100, 250, 500, 1000]}
        minWidth={1300}
        tableHead={
          <>
            <TableCell css={styles.sticky1} style={{ width: '74px' }}>操作</TableCell>
            <TableCell css={styles.sticky2} style={{ width: '85px' }}>日期</TableCell>
            <TableCell>科目名稱</TableCell>
            <TableCell>收入</TableCell>
            <TableCell>支出</TableCell>
            <TableCell>登錄者</TableCell>
            <TableCell>收付方式</TableCell>
            <TableCell>關係人</TableCell>
            <TableCell>備註</TableCell>
          </>
        }
      >
        <TableBody>
          {moneyFlows.moneyFlows.map((data, index) => {
            return (
              <TableRow key={index} css={styles.tableRow}>
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
      </ManagementTable>
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
