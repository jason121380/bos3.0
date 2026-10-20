/** @jsxImportSource @emotion/react */
// printGrid 外框（列印時隱藏）依規則保留 MUI Grid
import { Grid } from 'ui/grid-compat'
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { endOfMonth, format } from 'date-fns'
import useFetchMerchantIncomeStatementV2 from 'hooks/useFetchMerchantIncomeStatementV2'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetmerchantIncomeStatementV2Excel from 'hooks/useFetchGetmerchantIncomeStatementV2Excel'
import { useFetchGetCARPTDISPLAY } from 'hooks/useFetchGetParameterReportSetting'
import idx from 'idx'
import React, { useEffect, useState } from 'react'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  result: css({
    marginTop: theme.spacing(1),
  }),
}

export default function MerchantIncomeStatementMonthly() {
  const [merchantIncomeStatement, setMerchantIncomeStatement] = useState()
  const [CARPTDISPLAY, setCARPTDISPLAY] = useState(false)
  const [date, setDate] = React.useState({
    startDate: new Date().getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })


  const merchantIncomeStatementDataV2 = useFetchMerchantIncomeStatementV2({ date: date.startDate })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const getCARPTDISPLAY = useFetchGetCARPTDISPLAY()
  const [getmerchantIncomeStatementV2ExcelLazy, getmerchantIncomeStatementV2ExcelLazyData] = useFetchGetmerchantIncomeStatementV2Excel()

  useEffect(() => {
    if (!getCARPTDISPLAY.loading) {
      const data = idx(getCARPTDISPLAY, _ => _.data.getParameterReportSetting.CARPTDisplay)
      setCARPTDISPLAY(data)
    }
  }, [getCARPTDISPLAY.loading])


  useEffect(() => {
    if (!merchantIncomeStatementDataV2.loading && !isMemberShipCardActiveData.loading) {
      try {
        const merchantIncomeStatement = idx(
          merchantIncomeStatementDataV2,
          _ => _.data.merchantIncomeStatementV2.businessIncomeDetail.moneyFlowSetConnection
        )
        const isMemberShipCardActive = idx(isMemberShipCardActiveData,
          _ => _.data.getIsMemberShipCardActive
        )
        const filterData = []
        setMerchantIncomeStatement(filterData)
        merchantIncomeStatement.forEach(d => {
          if (!isMemberShipCardActive &&
            (
              d.subjectName === '會員卡收入' ||
              (d.subjectName.includes('第三方卡券') && d.subjectName.includes('(會員卡)'))
            )
          ) {
            if (d.cashRevenue !== 0 || d.cashExpenditure !== 0) filterData.push(d)
          } else {
            filterData.push(d)
          }
        })
      } catch (error) {
        openSnackbar({
          variant: 'error',
          message: error.message
        })
      }
    }
  }, [merchantIncomeStatementDataV2.loading, isMemberShipCardActiveData.loading])
  useEffect(() => {
    if (!getmerchantIncomeStatementV2ExcelLazyData.loading && getmerchantIncomeStatementV2ExcelLazyData.data !== undefined) {
      const url = idx(getmerchantIncomeStatementV2ExcelLazyData, _ => _.data.merchantIncomeStatementV2Excel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [getmerchantIncomeStatementV2ExcelLazyData.loading])

  const handleExcel = () => {
    getmerchantIncomeStatementV2ExcelLazy({
      variables: { date: date.startDate }
    })
  }
  return (
    <Page title="費用分析表" className='CostAnalysisReport ui-root'>
      <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
        <div className="merchantNamePrint">
          {JSON.parse(localStorage.getItem('userMerchant')).name +
            '   ' +
            format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
            '   ' +
            '費用分析表'}
        </div>
        <div className="merchantNamePrint">
          {'列印時間： ' +
            format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
        </div>
      </div>
      <PageHeader
        title="費用分析表"
        actions={
          <Grid item className="printGrid">
            <Button
              className="noprint"
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer strokeWidth={1.75} />
              列印
            </Button>
          </Grid>
        }
      />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={['lastmonth', 'thismonth', 'startDate']}
          dateChange={value => setDate(value)}
          onlyStart
          inputFormat='yyyy/MM'
          pickerOption={{
            views: ['month', 'year']
          }}
        />
      </Toolbar>
      {!merchantIncomeStatementDataV2.loading && merchantIncomeStatement !== undefined ? (
        <Results
          className={styles.result}
          merchantIncomeStatement={merchantIncomeStatement}
          handleExcel={handleExcel}
          excelLoading={getmerchantIncomeStatementV2ExcelLazyData.loading}
          CARPTDISPLAY={CARPTDISPLAY}
        />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}
