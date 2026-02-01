/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { startOfMonth, format } from 'date-fns'
import useFetchMoneyFlowTransferReport from 'hooks/useFetchMoneyFlowTransferReport'
import _ from 'lodash'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
  searchBtnDiv: ({
    marginBottom: '24px',
  }),
  noReportDiv: {
    textAlign: 'center',
    margin: '30px 0',
  },
  searchBtn: {
    width: '284px',
  },
  exportBtn: {
    float: 'right',
  },
  formGroup: {
    width: '10rem',
    marginLeft: theme.spacing(3),
  },
  topDiv: {
    display: 'flex',
    alignItems: 'center',
  },
}

const MoneyFlowTransferReport = () => {
  const [excelData, setExcelData] = useState([])
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: new Date().getTime(),
  })
  const moneyFlowTransferReport = useFetchMoneyFlowTransferReport({
    input: date,
  })

  useEffect(() => {
    if (!moneyFlowTransferReport.loading) {
      const data = idx(moneyFlowTransferReport, _ => _.data.moneyFlowTransferReport)
      setReportForDisplay(data)

      const excelData = []
      data.forEach(data => {
        excelData.push({
          日期: format(data.date, 'yyyy/MM/dd'),
          營業現金應收: data.businessCash,
          現金收支收入: data.cashRevenue,
          現金收支支出: data.cashExpenditure,
          匯款: data.bankTransfer,
          當日現金結存: data.cashBalance,
          累計現金結存: data.totalCashBalance,
        })
      })
      excelData.push({
        日期: '合計',
        營業現金應收: data.reduce((total, item) => (total = total + item.businessCash), 0),
        現金收支收入: data.reduce((total, item) => (total = total + item.cashRevenue), 0),
        現金收支支出: data.reduce((total, item) => (total = total + item.cashExpenditure), 0),
        匯款: '',
        當日現金結存: data.reduce((total, item) => (total = total + item.cashBalance), 0),
        累計現金結存: 'N/A',
      })
      setExcelData(excelData)
    }
  }, [moneyFlowTransferReport.loading])

  return (
    <Page css={styles.root} title="收支匯款表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='收支匯款表' subTitle='Money Flow Transfer Report' />
        <Grid container item justifyContent='space-between' alignItems='center'>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <CSVLink
            data={excelData}
            filename="收支匯款表.csv"
            style={{ display: 'inline' }}
          >
            <Button variant="contained" color="primary">
              報表匯出
            </Button>
          </CSVLink>
        </Grid>
        {!moneyFlowTransferReport.loading && reportForDisplay && excelData ? (
          <Results reportForDisplay={reportForDisplay} />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default MoneyFlowTransferReport
