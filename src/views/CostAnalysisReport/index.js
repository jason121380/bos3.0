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
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { HeaderActionsSlot, PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const styles = {
  result: 'mt-[8px]',
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
          <>
          <HeaderActionsSlot />
          <div className="printGrid print:hidden">
            <Button
              className="noprint"
              variant="secondary"
              onClick={() => window.print()}
            >
              <Printer strokeWidth={1.75} />
              列印
            </Button>
          </div>
          </>
        }
      />
      {/* 只有日期的報表：日期放 ReportToolbar 的 date 槽，不放篩選鈕（STYLE §14） */}
      <ReportToolbar
        date={
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
        }
      />
      {merchantIncomeStatementDataV2.error ? (
          <QueryFailed onRetry={() => merchantIncomeStatementDataV2.refetch()} />
        ) : !merchantIncomeStatementDataV2.loading && merchantIncomeStatement !== undefined ? (
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
