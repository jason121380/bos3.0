/** @jsxImportSource @emotion/react */
import { useState, useEffect, useMemo } from 'react'
import { Container, CircularProgress, Button, Grid } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import useFetchMerchantReportV3 from 'hooks/useFetchMerchantDailyReportV3'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import { startOfMonth, format } from 'date-fns'
import useFetchMerchantDashboard from 'hooks/useFetchMerchantDashboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import { useFetchGetNonCashDisplay } from 'hooks/useFetchGetParameterReportSetting'
import DateSelector from 'components/DateSelector'
import { theme } from '../../theme'
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
  printBtn: css({
    backgroundColor: '#3865AC',
  })
}

const MerchantDailyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })

  const [curentDayData, setCurentDayData] = useState(null)
  const [isServiceTicketMerged, setIsServiceTicketMerged] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)

  const merchantDailyReportDataV3 = useFetchMerchantReportV3({
    input: {
      startDate: startOfMonth(date.startDate).getTime(),
      endDate: date.startDate,
    },
  })
  const isServiceTicketMergedData = useFetchIsPriceDisplayOnDailyReportSetting()
  const merchantDailyReportCurrentDayData = useFetchMerchantReportV3({
    input: {
      startDate: date.startDate,
      endDate: date.startDate,
    },
  })
  const merchantDashboardData = useFetchMerchantDashboard({
    input: {
      startDate: date.startDate,
      endDate: date.startDate,
    },
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const nonCashDisplayData = useFetchGetNonCashDisplay()
  const merchantDashboard = idx(merchantDashboardData, _ => _.data.merchantDashboard) || {}
  const nonCashDisplay = idx(nonCashDisplayData, _ => _.data.getParameterReportSetting.nonCashDisplay) || false

  const mergeResultData = useMemo(() => {
    if (merchantDashboardData.loading) {
      return [];
    }
    const data = merchantDashboardData.data.merchantDashboard
    const { otherPayway, thirdPartTicket } = data
    const set = new Set()
    const setArr = []
    const finalData = []
    const arr = [
      { key: "otherPayway", name: 'paywayName' },
      { key: "thirdPartTicket", name: 'ticketName' },
    ]

    arr.forEach(({ key, name }) => {
      data[key].forEach(d => {
        set.add(d[name])
      })
    })

    for (const key of set) {
      setArr.push(key)
    }

    setArr.forEach(name => {
      const other = otherPayway.find(d => d.paywayName === name)
      const third = thirdPartTicket.find(d => d.ticketName === name)

      finalData.push({
        name,
        otherPayment: {
          usedPrice: other?.usedPrice ?? 0,
          usedPriceWithNoCash: other?.usedPriceWithNoCash ?? 0
        },
        thirdParty: {
          usedPrice: third?.usedPrice ?? 0,
          usedPriceWithNoCash: third?.usedPriceWithNoCash ?? 0
        }
      })
    })

    return finalData
  }, [merchantDashboardData.loading, merchantDashboardData.data?.merchantDashboard])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])
  useEffect(() => {
    if (!merchantDailyReportCurrentDayData.loading && !merchantDailyReportDataV3.loading) {
      const merchantDailyReportCurrentDay = idx(
        merchantDailyReportCurrentDayData,
        _ => _.data.merchantDailyReportV2
      )
      const merchantDailyReportData = idx(merchantDailyReportDataV3, _ => _.data.merchantDailyReportV2)
      setCurentDayData(merchantDailyReportCurrentDay)

      // 如果會員卡的數字不是0就要顯示
      const a = merchantDailyReportCurrentDay.currentDay.membership !== 0
      const b = merchantDailyReportData.currentDay.membership !== 0
      setMembershipDisplay(a || b)
    }
  }, [merchantDailyReportCurrentDayData.loading, merchantDailyReportDataV3.loading])
  useEffect(() => {
    if (!isServiceTicketMergedData.loading) {
      const isServiceTicketMerged = idx(
        isServiceTicketMergedData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isServiceTicketMerged
      )
      setIsServiceTicketMerged(isServiceTicketMerged)
    }
  }, [isServiceTicketMergedData.loading])
  return (
    <Page css={styles.root} title="店家日報表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '店家日報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='店家日報表' />
        <Grid container justifyContent='space-between' style={{ alignItems: 'center' }} className="noprint">
          <DateSelector
            date={date}
            attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
            onlyStart
            dateChange={value => setDate(value)}
            margin
          />
          <Button
            size="medium"
            variant="contained"
            color="primary"
            onClick={() => window.print()}
          >
            列印
          </Button>
        </Grid>

        {!merchantDailyReportDataV3.loading &&
          !isServiceTicketMergedData.loading &&
          !merchantDailyReportCurrentDayData.loading &&
          !merchantDashboardData.loading &&
          curentDayData !== null ? (
          idx(
            merchantDailyReportDataV3,
            _ =>
              _.data.merchantDailyReportV2 !== null && (
                <Results
                  merchantDailyReport={_.data.merchantDailyReportV2}
                  isServiceTicketMerged={isServiceTicketMerged}
                  curentDayData={curentDayData}
                  displayDate={date}
                  results={merchantDashboard}
                  membershipDisplay={membershipDisplay}
                  isMemberShipCardActive={isMemberShipCardActive}
                  mergeData={mergeResultData}
                  nonCashDisplay={nonCashDisplay}
                />
              )
          )
        ) : (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default MerchantDailyReport
