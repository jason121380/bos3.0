/** @jsxImportSource @emotion/react */
// 卡片保留相容層：列印樣式以 .IncomeStatementReportTableContainer .MuiCard-root／.MuiCardContent-root 排版表格（initialize.scss）
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { HeaderActionsPortal } from 'ui/page-header'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { CSVLink } from "react-csv";
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme/index.js'


const styles = {
  root: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
  content: css({
    padding: 0,
  }),
  nameCell: css({
    display: 'flex',
    alignItems: 'center',
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  }),
  leftCard: css({
    width: '55%',
  }),
  rightCard: css({
    width: '40%',
  }),
  subtotal: css({
    color: 'red',
    fontWeight: 'bold',
  }),
  cardBottom: css({
    marginBottom: '15px',
  }),
}

function Results({ className, incomeStatement }) {
  const [cashRevenue, setCashRevenue] = useState(0)
  const [cashExpenditure, setCashExpenditure] = useState(0)
  const [excelData, setExcelData] = useState([])
  useEffect(() => {
    const cashRevenue = incomeStatement
      .map(
        data =>
          data.subjectName !== '卡券販賣(不入業績)' &&
          data.subjectName !== '入金儲值(不入業績) - 現金' &&
          data.subjectName !== '入金儲值(不入業績) - 其他支付方式' &&
          data.subjectName !== '暫收墊款(ex.學費)' &&
          data.cashRevenue
      )
      .reduce((total, item) => (total = total + item), 0)
    setCashRevenue(cashRevenue)

    const cashExpenditure = incomeStatement
      .map(data => data.cashExpenditure)
      .reduce((total, item) => (total = total + item), 0)
    setCashExpenditure(cashExpenditure)
  }, [incomeStatement])

  useEffect(() => {
    const excelData = []

    const filteredReport = incomeStatement.filter(
      data =>
        data.subjectName !== '卡券販賣(不入業績)' &&
        data.subjectName !== '入金儲值(不入業績) - 現金' &&
        data.subjectName !== '入金儲值(不入業績) - 其他支付方式' &&
        data.subjectName !== '暫收墊款(ex.學費)'
    )
    const filteredReport2 = incomeStatement.filter(
      data =>
        data.subjectName === '卡券販賣(不入業績)' ||
        data.subjectName === '入金儲值(不入業績) - 現金' ||
        data.subjectName === '入金儲值(不入業績) - 其他支付方式' ||
        data.subjectName === '暫收墊款(ex.學費)'
    )

    filteredReport.forEach(data => {
      excelData.push({
        科目: data.subjectName,
        加項: Math.round(data.cashRevenue),
        '%':
          data.cashRevenue > 0
            ? `${roundDecimal(((data.cashRevenue / cashRevenue) * 100), 0)}%`
            : '0',
        扣項: data.cashExpenditure,
        '% ':
          data.cashExpenditure < 0
            ? `${roundDecimal(((data.cashExpenditure / cashExpenditure) * 100), 0)}%`
            : '0',
      })
    })
    excelData.push({
      科目: '小計',
      加項: Math.round(cashRevenue),
      '%': '100%',
      扣項: Math.round(cashExpenditure),
      '% ': '100%',
    })
    excelData.push({
      科目: '損益',
      加項: Math.round(cashRevenue + cashExpenditure),
      '%':
        cashRevenue > 0
          ? roundDecimal((((cashRevenue + cashExpenditure) / cashRevenue) * 100), 0)
          : 0,
      扣項: '',
      '% ': '',
    })
    filteredReport2.forEach(data => {
      excelData.push({
        科目: data.subjectName,
        加項: data.cashRevenue,
        '%': '',
        扣項: data.cashExpenditure,
        '% ': '',
      })
    })
    setExcelData(excelData)
  }, [incomeStatement, cashRevenue, cashExpenditure])

  return (
    <div
      css={css([styles.root, className])}
      className='IncomeStatementReportTableContainer flex w-full flex-wrap'
    >
      <div className="w-full min-[900px]:w-7/12">
        <Card>
          {/* 報表匯出：畫到頁首列印鈕左側（STYLE §14），匯出資料不變 */}
          <HeaderActionsPortal>
            <CSVLink
              data={excelData}
              className="noprint"
              filename="損益表.csv"
            >
              <Button variant="secondary">
                <Download strokeWidth={1.75} />
                報表匯出
              </Button>
            </CSVLink>
          </HeaderActionsPortal>
          <CardHeader
            className="IncomeStatementReportHeader"
            title="損益表"
          />
          {/* 原生 hr：列印規則以 hr 選擇器隱藏分隔線 */}
          <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
          <CardContent css={styles.content}>
            <PerfectScrollbar>
              <div css={styles.inner}>
                <Table dense>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>加項</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>扣項</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeStatement.map((data, index) => {
                      if (
                        data.subjectName !== '卡券販賣(不入業績)' &&
                        data.subjectName !== '入金儲值(不入業績) - 現金' &&
                        data.subjectName !== '入金儲值(不入業績) - 其他支付方式' &&
                        data.subjectName !== '暫收墊款(ex.學費)'
                      ) {
                        return (
                          <TableRow key={`IncomeStatement-${index}`}>
                            <TableCell>{data.subjectName}</TableCell>
                            <TableCell>
                              {data.cashRevenue > 0 ? Math.round(data.cashRevenue) : ''}
                            </TableCell>
                            <TableCell>
                              {data.cashRevenue > 0
                                ? `${roundDecimal(((data.cashRevenue / cashRevenue) * 100), 0)}%`
                                : ''}
                            </TableCell>
                            <TableCell>
                              {data.cashExpenditure < 0 ? Math.round(data.cashExpenditure) : ''}
                            </TableCell>
                            <TableCell>
                              {data.cashExpenditure < 0
                                ? `${roundDecimal(((data.cashExpenditure / cashExpenditure) * 100), 0)}%`
                                : ''}
                            </TableCell>
                          </TableRow>
                        )
                      }
                    })}
                    <TableRow>
                      <TableCell css={styles.subtotal}>小計</TableCell>
                      <TableCell>{Math.round(cashRevenue)}</TableCell>
                      <TableCell>100%</TableCell>
                      <TableCell>{Math.round(cashExpenditure)}</TableCell>
                      <TableCell>100%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell css={styles.subtotal}>損益</TableCell>
                      <TableCell>{Math.round(cashRevenue + cashExpenditure)}</TableCell>
                      <TableCell>
                        {cashRevenue > 0
                          ? roundDecimal((((cashRevenue + cashExpenditure) / cashRevenue) * 100), 0)
                          : 0}
                        %
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    {incomeStatement.map((data, index) => {
                      if (
                        data.subjectName === '卡券販賣(不入業績)' ||
                        data.subjectName === '入金儲值(不入業績) - 現金' ||
                        data.subjectName === '入金儲值(不入業績) - 其他支付方式' ||
                        data.subjectName === '暫收墊款(ex.學費)'
                      ) {
                        return (
                          <TableRow key={`IncomeStatement-${index}`}>
                            <TableCell>{data.subjectName}</TableCell>
                            <TableCell>
                              {data.cashRevenue > 0 ? Math.round(data.cashRevenue) : ''}
                            </TableCell>
                            <TableCell>
                            </TableCell>
                            <TableCell>
                              {data.cashExpenditure < 0 ? Math.round(data.cashExpenditure) : ''}
                            </TableCell>
                            <TableCell>
                            </TableCell>
                          </TableRow>
                        )
                      }
                    })}
                  </TableBody>
                </Table>
              </div>
            </PerfectScrollbar>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

Results.propTypes = {
  className: PropTypes.object,
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
