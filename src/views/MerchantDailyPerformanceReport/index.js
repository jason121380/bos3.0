/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button, Card } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import ReferToggleButton from 'components/ReferToggleButton'
import { endOfDay, startOfMonth, format } from 'date-fns'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import useFetchGetMerchantDailyPerformanceReport from 'hooks/useFetchGetMerchantDailyPerformanceReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import produce from 'immer'

import Results from './Results'

const styles = {
  container: css({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(1),
  }),
}

function DesignerPerformOverview() {
  const [dailyPerformanceData, setDailyPerformanceData] = useState(null)
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)
  const [attributeSwitchs, setAttributeSwitchs] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [inputData, setInputData] = useState({
    displayReference: 'FAKE',
    dateRange: {
      startDate: startOfMonth(new Date()).getTime(),
      endDate: endOfDay(new Date()).getTime(),
    }
  })
  const [excelData, setExcelData] = useState([])
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const merchantDailyPerformanceReportData = useFetchGetMerchantDailyPerformanceReport({
    input: inputData
  })

  const handleSetInputData = (key, value) => {
    setInputData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading && !isMemberShipCardActiveData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])

  useEffect(() => {
    if (!merchantDailyPerformanceReportData.loading) {
      const merchantDailyPerformanceReport = idx(
        merchantDailyPerformanceReportData,
        _ => _.data.merchantDailyPerformanceReport
      )
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const memberActive = merchantDailyPerformanceReport.some(({ performance }) => performance.isMemberShipCardActive > 0 || performance.membershipPerformance > 0 || performance.membershipAveragePerformance > 0) || isMemberShipCardActive

      setMembershipDisplay(memberActive)
      setDailyPerformanceData(merchantDailyPerformanceReport)

      const excelData = []
      const attributeSwitch = []

      merchantDailyPerformanceReport.forEach(({ performance }) => {
        performance.categoryData.forEach((category, index) => {
          if (attributeSwitch[index]) {
            return
          } else {
            attributeSwitch[index] = Boolean(category.fakePerformance > 0 || category.orderCount > 0 || category.averagePerformance > 0)
          }
        })
      })

      merchantDailyPerformanceReport.forEach(({ date, performance }) => {
        const {
          fakePerformance, orderCount, averagePerformance, productPerformance, productOrderCount,
          membershipPerformance, membershipOrderCount, membershipAveragePerformance, customerUnknownCount,
          productAveragePerformance, orderMaleCount, orderFemaleCount, orderUnknownCount, categoryData,
          orderDesignateCount, orderNonDesignatecount, customerMaleCount, customerFemaleCount
        } = performance
        const obj = {}
        obj['日期'] = format(date, 'yyyy/MM/dd')
        obj['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${Math.round(orderCount)} / ${Math.round(averagePerformance)}`
        obj['店販業績/人次/單均價'] = `${Math.round(productPerformance)} / ${Math.round(productOrderCount)} / ${Math.round(productAveragePerformance)}`
        if (memberActive) {
          obj['會員卡業績/人次/單均價'] = `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
        }
        obj['男/女/未知 (人次)'] = `${orderMaleCount} / ${orderFemaleCount} / ${orderUnknownCount}`
        obj['指定/不指定 (人次)'] = `${orderDesignateCount} / ${orderNonDesignatecount}`
        obj['男/女/未知 (不重複)'] = ` ${customerMaleCount} / ${customerFemaleCount} / ${customerUnknownCount}`

        categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
          if (attributeSwitch[index]) {
            obj[`${categoryName}` + '/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
          }
        })
        excelData.push(obj)
      })
      setExcelData(excelData)
      setAttributeSwitchs(attributeSwitch)
    }
  }, [merchantDailyPerformanceReportData.loading, isMemberShipCardActiveData.loading])

  return (
    <Page title="每日業績分析表">
      <Container maxWidth={false} css={styles.container}>
        <Card
          css={css({
            display: 'flex',
            padding: '12px 24px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: 'none',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          })}
        >
          <AdminPageHeader title='每日業績分析表' />
          <CSVLink
            data={excelData}
            filename="每日業績分析表.csv"
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="contained"
              css={css({
                borderRadius: '20px !important',
                padding: '6px 20px !important',
                fontSize: '14px !important',
                boxShadow: 'none !important',
                fontWeight: 'bold !important',
                backgroundColor: '#f5f5f5 !important',
                color: '#666 !important',
                '&:hover': {
                  backgroundColor: '#eeeeee !important',
                }
              })}
            >
              報表匯出
            </Button>
          </CSVLink>
        </Card>

        <Grid container direction='row' alignItems='center' style={{ gap: 20 }}>
          <Grid item>
            <DateSelector
              date={inputData.dateRange}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => handleSetInputData('dateRange', value)}
              margin
            />
          </Grid>
          <Grid item style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0 20px' }}>
            {!isDisplayTogglePerformanceButton && <Grid item >
              <div className="divText">業績依據：</div>
              <ReferToggleButton
                value={inputData.displayReference}
                onChange={value => handleSetInputData('displayReference', value)}
              />
            </Grid>}
          </Grid>
        </Grid>
        {(!merchantDailyPerformanceReportData.loading && dailyPerformanceData !== null) ? (
          <Results
            className={styles.results}
            results={dailyPerformanceData}
            membershipDisplay={membershipDisplay}
            attributeSwitchs={attributeSwitchs}
          />
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default DesignerPerformOverview
