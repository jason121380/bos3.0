/** @jsxImportSource @emotion/react */
import { Container, Grid, Button, CircularProgress, Typography } from '@mui/material'
import AdminPageHeader from 'components/AdminPageHeader'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { subMonths } from 'date-fns'
import useFetchUserSalaryReport from 'hooks/useFetchUserSalaryReport'
import DesignerSearch from 'components/DesignerBeenAssistedAutoComplete'
import DateSelector from 'components/DateSelector'
import useFetchMerchantSalaryIncreaseItems from 'hooks/useFetchMerchantSalaryIncreaseItems'
import useFetchMerchantSalaryDecreaseItems from 'hooks/useFetchMerchantSalaryDecreaseItems'
import { useFetchGetUserSalaryExcelLazy } from 'hooks/useFetchGetUserSalaryExcel'
import useFetchGetIsDisplayFakePerformanceInSalaryReport from 'hooks/useFetchGetIsDisplayFakePerformanceInSalaryReport'
import useFetchGetEmployeePayslipPrintStyle from 'hooks/useFetchGetEmployeePayslipPrintStyle'
import useFetchGetIsEPWDDisplay from 'hooks/useFetchGetIsEPWDDisplay'
import useFetchGetIsPrintDetailDisplayOnSalaryReport from 'hooks/useFetchGetIsPrintDetailDisplayOnSalaryReport'
import {
  useFetchGetPayslipOptimization, useFetchGetIsPrintDateHiddenForPayslip
} from 'hooks/useFetchGetParameterCheckoutAndSalaryItemsSetting'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  })
}

export default function Payroll() {
  const [date, setDate] = useState({
    startDate: subMonths(new Date(), 1).getTime(),
  })
  const usersDalaryData = useFetchUserSalaryReport({ date: date.startDate })
  const [searchId, setSearchId] = useState()
  const userSalary = idx(usersDalaryData, _ => _.data.userSalaryReport)
  const merchantSalaryIncreaseItemsData = useFetchMerchantSalaryIncreaseItems()
  const merchantSalaryDecreaseItemsData = useFetchMerchantSalaryDecreaseItems()
  const employeePayslipPrintStyle = useFetchGetEmployeePayslipPrintStyle()
  const [merchantSalaryIncreaseItems, setMerchantSalaryIncreaseItems] = useState([])
  const [merchantSalaryDecreaseItems, setMerchantSalaryDecreaseItems] = useState([])
  const [getUserSalaryExcelLazy, getUserSalaryExcelLazyData] = useFetchGetUserSalaryExcelLazy()
  const isDisplayFakePerformance = useFetchGetIsDisplayFakePerformanceInSalaryReport()
  const EPWDDisplay = useFetchGetIsEPWDDisplay()
  const getIsPrintDetailDisplayOnSalaryReport = useFetchGetIsPrintDetailDisplayOnSalaryReport()
  const getPayslipOptimization = useFetchGetPayslipOptimization()
  const getIsPrintdetailHidden = useFetchGetIsPrintDateHiddenForPayslip()
  const detailDisplay = getIsPrintDetailDisplayOnSalaryReport.loading ? true : idx(getIsPrintDetailDisplayOnSalaryReport, _ => _.data.getIsPrintDetailDisplayOnSalaryReport)
  const payslipOptimization = getPayslipOptimization.loading ? false : idx(getPayslipOptimization, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPayslipOptimizationPrintModeOn)
  const isPrintdetailHidden = getIsPrintdetailHidden.loading ? false : idx(getIsPrintdetailHidden, _ => _.data.getParameterCheckoutAndSalaryItemsSetting.isPrintDateHiddenForPayslip)

  useEffect(() => {
    if (!merchantSalaryIncreaseItemsData.loading) {
      const merchantSalaryIncreaseItems = idx(
        merchantSalaryIncreaseItemsData,
        _ => _.data.getMerchantSalaryIncreaseItems
      )
      setMerchantSalaryIncreaseItems(merchantSalaryIncreaseItems)
    }
  }, [merchantSalaryIncreaseItemsData.loading])
  useEffect(() => {
    if (!merchantSalaryDecreaseItemsData.loading) {
      const merchantSalaryDecreaseItems = idx(
        merchantSalaryDecreaseItemsData,
        _ => _.data.getMerchantSalaryDecreaseItems
      )
      setMerchantSalaryDecreaseItems(merchantSalaryDecreaseItems)
    }
  }, [merchantSalaryDecreaseItemsData.loading])
  useEffect(() => {
    if (!merchantSalaryIncreaseItems.loading && userSalary != undefined) {
      userSalary.map(data => {
        const increase = idx(data, _ => _.increaseItem)
        increase.map(data2 => {
          if (
            data2.itemName !== '' &&
            merchantSalaryIncreaseItems.find(data3 => data3.itemSetting === data2.itemName) ===
            undefined
          ) {
            merchantSalaryIncreaseItems.push({
              itemSetting: data2.itemName,
            })
          }
        })
      })
    }
  }, [merchantSalaryIncreaseItems.loading, userSalary])
  useEffect(() => {
    if (!merchantSalaryDecreaseItems.loading && userSalary != undefined) {
      userSalary.map(data => {
        const decrease = idx(data, _ => _.decreaseItem)
        decrease.map(data2 => {
          if (
            data2.itemName !== '' &&
            merchantSalaryDecreaseItems.find(data3 => data3.itemSetting === data2.itemName) ===
            undefined
          ) {
            merchantSalaryDecreaseItems.push({
              itemSetting: data2.itemName,
            })
          }
        })
      })
    }
  }, [merchantSalaryDecreaseItems.loading, userSalary])
  useEffect(() => {
    if (!getUserSalaryExcelLazyData.loading && getUserSalaryExcelLazyData.data !== undefined) {
      const url = idx(getUserSalaryExcelLazyData, _ => _.data.userSalaryReportExcel)
      const link = document.createElement('a')
      link.href = url
      link.click()
    }
  }, [getUserSalaryExcelLazyData.loading])

  const handleExcel = () => {
    getUserSalaryExcelLazy({
      variables: {
        date: date.startDate,
        designerId: searchId,
      }
    })
  }
  return (
    <Page title="薪資條" css={styles.root} className='EmployeePayslip'>
      <Container maxWidth={false} css={styles.container}>
        <AdminPageHeader
          title="薪資條"
          secondaryActions={[
            {
              label: '報表匯出',
              onClick: handleExcel,
              disabled: getUserSalaryExcelLazyData.loading,
              className: "noprint"
            },
            {
              label: '列印',
              onClick: () => window.print(),
              className: "noprint"
            }
          ]}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
            <DesignerSearch
              value={searchId}
              label="設計師編號/姓名"
              onChange={value => setSearchId(value.userId)}
            />
          </div>
        </AdminPageHeader>

        {(!usersDalaryData.loading && !isDisplayFakePerformance.loading && !getIsPrintDetailDisplayOnSalaryReport.loading && !EPWDDisplay.loading) ?
          idx(
            usersDalaryData,
            _ =>
              _.data.userSalaryReport.length > 0 ? (
                <Grid container className={'EmployeePayslipTableContainer'}>
                  <Results
                    userSalaryReport={_.data.userSalaryReport}
                    date={date.startDate}
                    searchId={searchId}
                    EPWDDisplay={EPWDDisplay.data.getIsEPWDDisplay}
                    isDisplayFakePerformance={idx(
                      isDisplayFakePerformance,
                      _ => _.data.getIsDisplayFakePerformanceInSalaryReport
                    )}
                    printStyle={idx(
                      employeePayslipPrintStyle,
                      _ => _.data.getEmployeePayslipPrintStyle
                    )}
                    detailDisplay={!isPrintdetailHidden && !detailDisplay}
                    payslipOptimization={payslipOptimization}
                  />
                </Grid>
              ) : <Typography style={{ textAlign: 'center', marginTop: '100px' }} variant="h3" gutterBottom component="div">無資料</Typography>
          ) :
          <div style={{ textAlign: 'center', marginTop: '100px' }}><CircularProgress /></div>
        }
      </Container>
    </Page>
  )
}
