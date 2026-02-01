/** @jsxImportSource @emotion/react */
import { Container, CircularProgress, Grid, Button } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import ReferToggleButton from 'components/ReferToggleButton'
import { endOfDay, startOfMonth } from 'date-fns'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import useFetchMerchantImmediatePerformReport from 'hooks/useFetchMerchantImmediatePerformanceReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import idx from 'idx'
import { useEffect, useState } from 'react'
import { CSVLink } from "react-csv";
import DateSelector from 'components/DateSelector'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import PerformResultsV2 from './PerformResultsV2'

const styles = {
  root: css({}),
  container: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(1),
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
  formGroup: css({
    width: '150px',
    margin: '10px',
  }),
}

function DesignerPerformOverview() {
  const [performReference, setPerformReference] = useState('FAKE')
  const [attributeSwitchs, setAttributeSwitchs] = useState([])
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const [excelData, setExcelData] = useState([])
  const [merchantImmediatePerformReport, setMerchantImmediatePerformReport] = useState(null)

  // 隱藏虛實業績切換按鈕 --------------------------------------------------------------------------------
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)

  // 會員卡功能是否開啟
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading && !isMemberShipCardActiveData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])
  // ---------------------------------------------------------------------------------------------------
  const merchantImmediatePerformReportData = useFetchMerchantImmediatePerformReport({
    input: date,
    displayReference: performReference,
  })

  useEffect(() => {
    if (!merchantImmediatePerformReportData.loading) {
      const merchantImmediatePerformReport = idx(
        merchantImmediatePerformReportData,
        _ => _.data.merchantImmediatePerformanceReport
      )
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      setMerchantImmediatePerformReport(merchantImmediatePerformReport)
      const { users, wholeStore } = merchantImmediatePerformReport
      const { membershipPerformance, membershipOrderCount, membershipAveragePerformance } = wholeStore
      const memberActive = isMemberShipCardActive || membershipPerformance > 0 || membershipOrderCount > 0 | membershipAveragePerformance > 0
      const excelData = []
      const attributeSwitch = []
      setMembershipDisplay(memberActive)
      users[0].categoryData.forEach(() => {
        attributeSwitch.push(false)
      })
      users.forEach(data => {
        data.categoryData.forEach((category, index) => {
          if (
            category.fakePerformance > 0 ||
            category.orderCount > 0 ||
            category.averagePerformance > 0
          ) {
            attributeSwitch[index] = true
          }
        })
      })

      if (users != null && wholeStore != null) {
        users.forEach(element => {
          const obj = {}
          const {
            fakePerformance, orderCount, averagePerformance, productPerformance, productOrderCount,
            membershipPerformance, membershipOrderCount, membershipAveragePerformance,
            productAveragePerformance, orderMaleCount, orderFemaleCount, orderUnknownCount, userNo,
            userName, orderDesignateCount, orderNonDesignatecount, customerMaleCount, customerFemaleCount,
            customerUnknownCount, categoryData
          } = element
          if (
            fakePerformance > 0 || orderCount > 0 || averagePerformance > 0 ||
            productPerformance > 0 || productOrderCount > 0 || productAveragePerformance > 0 ||
            membershipPerformance > 0 || membershipOrderCount > 0 || membershipAveragePerformance > 0 ||
            orderMaleCount > 0 || orderFemaleCount > 0 || orderUnknownCount > 0
          ) {
            obj['編號'] = userNo
            obj['設計師'] = userName
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
          }
        })
        const obj2 = {}
        const {
          categoryData, fakePerformance, orderCount, averagePerformance, productPerformance,
          productOrderCount, productAveragePerformance, orderMaleCount, orderFemaleCount,
          membershipPerformance, membershipOrderCount, membershipAveragePerformance,
          orderUnknownCount, orderDesignateCount, orderNonDesignatecount, customerMaleCount,
          customerFemaleCount, customerUnknownCount
        } = wholeStore

        obj2['設計師'] = '全店'
        obj2['服務業績/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
        obj2['店販業績/人次/單均價'] = `${Math.round(productPerformance)} / ${productOrderCount} / ${Math.round(productAveragePerformance)}`
        if (memberActive) {
          obj2['會員卡業績/人次/單均價'] = `${Math.round(membershipPerformance)} / ${Math.round(membershipOrderCount)} / ${Math.round(membershipAveragePerformance)}`
        }
        obj2['男/女/未知 (人次)'] = `${Math.round(orderMaleCount)} / ${orderFemaleCount} / ${Math.round(orderUnknownCount)}`
        obj2['指定/不指定 (人次)'] = `${Math.round(orderDesignateCount)} / ${orderNonDesignatecount}`
        obj2['男/女/未知 (不重複)'] = `${Math.round(customerMaleCount)} / ${customerFemaleCount} / ${Math.round(customerUnknownCount)}`

        categoryData.map(({ categoryName, fakePerformance, orderCount, averagePerformance }, index) => {
          if (attributeSwitch[index]) {
            obj2[`${categoryName}` + '/人次/單均價'] = `${Math.round(fakePerformance)} / ${orderCount} / ${Math.round(averagePerformance)}`
          }
        })
        excelData.push(obj2)
      }
      setExcelData(excelData)
      setAttributeSwitchs(attributeSwitch)
    }
  }, [merchantImmediatePerformReportData.loading, isMemberShipCardActiveData.loading])

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }

  return (
    <Page css={styles.root} title="全店業績分析表">
      <Container maxWidth={false} css={styles.container}>
        <PageTitle title='全店業績分析表' subTitle='Designer Perform Overview' />
        <Grid container direction='row' alignItems='center' style={{ gap: 20 }}>
          <Grid item>
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
              margin
            />
          </Grid>
          <Grid item style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0 20px' }}>
            {!isDisplayTogglePerformanceButton && <Grid item style={{ marginTop: -22 }} >
              <div className="divText">業績依據：</div>
              <ReferToggleButton
                value={performReference}
                onChange={handleToggleButtonChange}
              />
            </Grid>}
            <Grid item>
              <CSVLink
                data={excelData}
                filename="全店業績分析表.csv"
                style={{ display: 'inline' }}
              >
                <Button variant="contained" color="primary">
                  報表匯出
                </Button>
              </CSVLink>
            </Grid>
          </Grid>
        </Grid>
        {(!merchantImmediatePerformReportData.loading && merchantImmediatePerformReport !== null) ? (
          <PerformResultsV2
            className={styles.results}
            results={merchantImmediatePerformReport}
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
