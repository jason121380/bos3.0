/** @jsxImportSource @emotion/react */
import {
  Container, Grid, Button, CircularProgress,
} from '@mui/material'
import Page from 'components/Page'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import useFetchGetMembershipSellReport from 'hooks/useFetchGetMembershipSellReport'
import AdminPageHeader from 'components/AdminPageHeader'
import { startOfDay, endOfDay, format } from 'date-fns'
import { CSVLink } from "react-csv";
import roundDecimal from './../../helper/roundDecimal.js'
import { theme } from '../../theme/index.js'
import { css } from '@emotion/react'

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
  formControl: css({
    width: '100px',
  }),
}

export default function MembershipSellReport() {
  const [excelData, setExcelData] = useState([])
  const [inputData, setInputData] = useState({
    startDate: startOfDay(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
    employeeId: '',
    customerId: '',
    membershipId: '',
  })
  const [reportData, setReportData] = useState([])
  const getMembershipSellReport = useFetchGetMembershipSellReport({
    input: {
      dateRange: {
        startDate: inputData.startDate,
        endDate: inputData.endDate,
      },
      designerId: inputData.employeeId === '' ? null : inputData.employeeId,
      customerId: inputData.customerId === '' ? null : inputData.customerId,
      membershipId: inputData.membershipId === '' ? null : inputData.membershipId,
    }
  })

  const handleCountTotal = key => {
    const total = reportData.reduce((a, b) => a + b[key], 0)
    return roundDecimal(total)
  }

  useEffect(() => {
    if (!getMembershipSellReport.loading) {
      const data = idx(getMembershipSellReport, _ => _.data.membershipSellReport)
      setReportData(data)
    }
  }, [getMembershipSellReport])

  useEffect(() => {
    const data = []
    reportData.forEach(d => {
      data.push({
        訂單日期: format(d.orderDate, 'yyyy/M/d'),
        訂單編號: `#${d.orderNo}`,
        設計師姓名: d.designerName,
        顧客姓名: d.customerName,
        會員卡名稱: d.membershipName,
        實際售價: d.sellPrice,
        數量: d.count,
        小計: d.summary,
        手續費: roundDecimal(d.handlingFee),
        '販賣業績(實)': roundDecimal(d.truth),
        抽成: roundDecimal(d.rake),
        備註: d.remark,
        到期日: d.expiryDate ? format(d.expiryDate, 'yyyy/M/d') : '永久會籍'
      })
    })
    data.push({
      訂單日期: '',
      訂單編號: '',
      設計師姓名: ' ',
      顧客姓名: '',
      會員卡名稱: '合計',
      實際售價: handleCountTotal('sellPrice'),
      數量: handleCountTotal('count'),
      小計: handleCountTotal('summary'),
      手續費: handleCountTotal('handlingFee'),
      '販賣業績(實)': handleCountTotal('truth'),
      抽成: handleCountTotal('rake'),
      備註: '',
      到期日: '',
    })
    setExcelData(data)
  }, [reportData])

  return (
    <Page css={styles.root} title="會員卡銷售報表">
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader title='會員卡銷售報表' />
        <Grid container style={{ gap: 10 }} alignItems="baseline" justifyContent="space-between">
          <Grid item>
            <MerchantSearchBar
              values={inputData}
              onFilter={values => setInputData(values)}
              outside
              visible={['datePicker', 'employee', 'customer', 'membershipcard']}
              lastInLeaderBoard={true}
            />
          </Grid>
          <Grid item style={{ marginBottom: 10 }}>
            <CSVLink data={excelData} filename="會員卡銷售報表.csv">
              <Button variant="contained" color="primary">
                報表匯出
              </Button>
            </CSVLink>
          </Grid>
        </Grid>
        {!getMembershipSellReport.loading ? (
          <Results
            reportData={reportData}
            format={format}
            roundDecimal={roundDecimal}
            handleCountTotal={handleCountTotal}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <CircularProgress color="inherit" />
          </div>
        )}
      </Container>
    </Page>
  )
}
