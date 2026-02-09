/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import { Container, Grid, Typography, CircularProgress, Button } from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import useFetchDesignerReport from 'hooks/useFetchDesignerDailyReport'
import { format } from 'date-fns'
import idx from 'idx'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import useFetchGetIsZeroValueHiddenOnDailyReport from 'hooks/useFetchGetIsZeroValueHiddenOnDailyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsOptimizationPrintModeOn from 'hooks/useFetchGetIsOptimizationPrintModeOn'
import DateSelector from 'components/DateSelector'
import _ from 'lodash'
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
  printBtn: css({}),
}

const EmployeeDailyReport = () => {
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const [priceDisplayOnReport, setPriceDisplayOnReport] = useState(false)
  const [isHelperPointPriceDisplay, setIsHelperPointPriceDisplay] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [printData, setPrintData] = useState([])
  const [printMode, setPrintMode] = useState(false)

  const designerReportData = useFetchDesignerReport({ date: date.endDate })
  const isPriceDisplayOnDailyReportData = useFetchIsPriceDisplayOnDailyReportSetting()
  const isZeroValueHiddenOnDailyReportData = useFetchGetIsZeroValueHiddenOnDailyReport()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const optimizationPrintMode = useFetchGetIsOptimizationPrintModeOn()
  const isHiddenZero = idx(
    isZeroValueHiddenOnDailyReportData,
    _ => _.data.getIsZeroValueHiddenOnDailyReport
  )

  useEffect(() => {
    if (!optimizationPrintMode.loading) {
      const data = idx(optimizationPrintMode, _ => _.data.getIsOptimizationPrintModeOn)
      setPrintMode(data)
    }
  }, [optimizationPrintMode.loading])

  useEffect(() => {
    if (!designerReportData.loading) {
      const data = idx(designerReportData, _ => _.data.designerDailyReport)
      let group = []
      const report = []
      data.forEach((d, index) => {
        group.push((d))
        if (group.length === 4) {
          report.push(group)
          group = []
        } else if (index === (data.length - 1)) {
          report.push(group)
          group = []
        }
      })
      setPrintData(report)
    }
  }, [designerReportData.loading])


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
    if (!isPriceDisplayOnDailyReportData.loading) {
      const isPriceDisplayOnDailyReport = idx(
        isPriceDisplayOnDailyReportData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isPriceDisplayOnDailyReport
      )
      const isHelperPointPriceDisplay = idx(
        isPriceDisplayOnDailyReportData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setPriceDisplayOnReport(isPriceDisplayOnDailyReport)
      setIsHelperPointPriceDisplay(isHelperPointPriceDisplay)
    }
  }, [isPriceDisplayOnDailyReportData.loading])
  return (
    <Page css={styles.root} title="設計師日報表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師日報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='設計師日報表' />
        <Grid container alignItems='center' justifyContent='space-between' className="noprint">
          <DateSelector
            date={date}
            attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
            onlyStart
            dateChange={value => setDate(value)}
            margin
          />
          <Button
            className="noprint"
            size="medium"
            variant="contained"
            color="primary"
            onClick={() => window.print()}
          >
            列印
          </Button>
        </Grid>

        {!designerReportData.loading && !isPriceDisplayOnDailyReportData.loading ? (
          idx(designerReportData, _ =>
            _.data.designerDailyReport.length > 0 ? (
              <Grid container spacing={3} className='EmployeeDailyReport'>
                <Results
                  designerDailyReport={_.data.designerDailyReport}
                  printData={printData}
                  titleDate={date.endDate}
                  priceDisplayOnReport={priceDisplayOnReport}
                  isHelperPointPriceDisplay={isHelperPointPriceDisplay}
                  isHiddenZero={isHiddenZero}
                  isMemberShipCardActive={isMemberShipCardActive}
                  printMode={printMode}
                />
              </Grid>
            ) : (
              <Typography variant="h3" gutterBottom component="div">
                無資料
              </Typography>
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

export default EmployeeDailyReport
