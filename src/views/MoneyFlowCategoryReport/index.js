/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { startOfMonth, format } from 'date-fns'
import useFetchMoneyFlowCategoryReport from 'hooks/useFetchMoneyFlowCategoryReport'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme/index.js'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
  searchBtnDiv: css({
    marginBottom: '24px',
  }),
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  searchBtn: css({
    width: '284px',
  }),
  exportBtn: css({
    float: 'right',
  }),
  formGroup: css({
    width: '10rem',
    marginLeft: theme.spacing(3),
  }),
  topDiv: css({
    display: 'flex',
    alignItems: 'center',
  }),
}

const MoneyFlowCategoryReport = () => {
  const [reportForDisplay, setReportForDisplay] = useState([])
  const [excelData, setExcelData] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const [reportWithAmount, setReportWithAmount] = useState(null)

  const moneyFlowCategoryReportData = useFetchMoneyFlowCategoryReport({
    input: date,
  })

  useEffect(() => {
    if (!moneyFlowCategoryReportData.loading) {
      const report = idx(
        moneyFlowCategoryReportData,
        _ => _.data.moneyFlowCategoryReport.moneyFlowCategoryReport
      )

      report.forEach((data, index) => {
        report[index].moneyFlow.push({
          date: 0,
          expenditure: 0,
          remark: '',
          revenue: 0,
          subjectName: '小結',
          subjectNo: '',
          amount:
            report[index].revenueSummary > 0
              ? report[index].revenueSummary
              : -Math.abs(report[index].expenditureSummary),
        })
      })
      setReportWithAmount(report)
    }
  }, [moneyFlowCategoryReportData.loading])
  useEffect(() => {
    if (!moneyFlowCategoryReportData.loading) {
      const excelData = []
      const report = idx(moneyFlowCategoryReportData, _ => _.data.moneyFlowCategoryReport)

      setReportForDisplay(report)
      report.moneyFlowCategoryReport.forEach(data => {
        data.moneyFlow.forEach(d => {
          if (d.subjectName !== '小結') {
            excelData.push({
              日期: format(d.date, 'yyyy/MM/dd'),
              科目編號: d.subjectNo,
              科目名稱: d.subjectName,
              收入金額: d.revenue !== 0 ? d.revenue : '',
              支出金額: d.expenditure !== 0 ? d.expenditure : '',
              備註: d.remark,
            })
          }
          if (d.subjectName === '小結') {
            excelData.push({
              日期: '',
              科目編號: d.subjectNo,
              科目名稱: d.subjectName,
              收入金額: d.amount > 0 ? d.amount : '',
              支出金額: d.amount > 0 ? '' : Math.abs(d.amount),
              備註: d.remark,
            })
          }
        })
      })
      excelData.push({
        日期: '合計',
        收入金額: roundDecimal(report.revenueSummary),
        支出金額: roundDecimal(report.expenditureSummary),
      })

      setExcelData(excelData)
    }
  }, [moneyFlowCategoryReportData.loading])

  return (
    <Page css={styles.root} title="收支分類明細表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='收支分類明細表' subTitle='Money Flow Category Report' />
        <Grid container item justifyContent='space-between' alignItems='center'>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <CSVLink
            data={excelData}
            filename="收支分類明細表.csv"
            style={{ display: 'inline' }}
          >
            <Button variant="contained" color="primary">
              報表匯出
            </Button>
          </CSVLink>
        </Grid>
        {!moneyFlowCategoryReportData.loading &&
          reportForDisplay !== null &&
          reportWithAmount !== null ? (
          <Results report={reportForDisplay} reportWithAmount={reportWithAmount} roundDecimal={roundDecimal} />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default MoneyFlowCategoryReport
