/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react'
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import useFetchCustomerWalletBalance from 'hooks/useFetchCustomerWalletReport'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import { CSVLink } from "react-csv";
import PageTitle from 'components/PageTitle'
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
  noReportDiv: css({
    textAlign: 'center',
    margin: '30px 0',
  }),
  field: css({
    width: '240px',
  }),
}

const CustomerWalletBalance = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [designerValue, setDesignerValue] = useState([])
  const [pageSetting, setPageSetting] = React.useState({
    pageLimit: 50,
    pageOffset: 0,
    designerId: designerValue,
    customerId: [],
  })
  const customerWalletBalanceData = useFetchCustomerWalletBalance({
    input: pageSetting,
  })
  useEffect(() => {
    if (!customerWalletBalanceData.loading) {
      const excelData = []
      const report = idx(
        customerWalletBalanceData,
        _ => _.data.customerWalletReport.customerWalletReport
      )
      const sum = report.reduce((accu, curVal) => accu + curVal.leftWallet, 0)
      setReportForDisplay(report)
      report.forEach(data => {
        excelData.push({
          客戶編號: data.customerNo,
          客戶姓名: data.customerName,
          所屬設計師: data.preferDesignerName,
          儲值餘額: data.leftWallet,
        })
      })
      excelData.push({
        客戶編號: '合計',
        儲值餘額: sum,
      })
      setExcelData(excelData)
    }
  }, [customerWalletBalanceData.loading])
  let customerIdValue = ''
  if (pageSetting.customerId.length > 0) {
    pageSetting.customerId.forEach(id => {
      customerIdValue = id
    })
  }
  const handleDesignerChange = value => {
    const tmp = value.userId !== undefined || value.id !== '' ? [value.userId] : []
    setDesignerValue(value.userId !== undefined ? value.userId : [])
    setPageSetting({
      ...pageSetting,
      designerId: tmp,
    })
  }
  return (
    <Page css={styles.root} title="顧客入金餘額表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='顧客入金餘額表' subTitle='Customer Wallet Balance' />
        <Grid style={{ direction: 'row', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', margin: '12px 0', gap: 10 }}>
          <Grid style={{ gap: 10, display: 'flex', flexWrap: 'wrap' }}>
            <EmployeeAutoComplete
              label={'設計師編號/姓名'}
              value={designerValue}
              onChange={value => handleDesignerChange(value)}
              className={styles.field}
            />
            <CustomerAutoComplete
              className={styles.option}
              label={'顧客編號/姓名'}
              value={customerIdValue}
              onChange={value =>
                setPageSetting({
                  ...pageSetting,
                  customerId: value.id !== '' ? [value.id] : [],
                })
              }
            />
          </Grid>
          <Grid style={{ display: 'flex', alignItems: 'center' }}>
            <CSVLink
              data={excelData}
              filename="顧客入金餘額表.csv"
              style={{ display: 'inline' }}
            >
              <Button variant="contained" color="primary">
                報表匯出
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
        {!customerWalletBalanceData.loading && reportForDisplay !== null ? (
          <Results report={reportForDisplay} />
        ) : (
          <div css={styles.noReportDiv}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default CustomerWalletBalance
