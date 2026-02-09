/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react'
import {
  Container, Grid, Typography, CircularProgress, Button, Checkbox,
  TextField, Autocomplete,
} from '@mui/material'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import DateSelector from 'components/DateSelector'
import { format } from 'date-fns'
import idx from 'idx'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsOptimizationPrintModeOn from 'hooks/useFetchGetIsOptimizationPrintModeOn'
import useFetchGetDesignerNameForReportType from 'hooks/useFetchGetDesignerNameForReportType'
import useFetchGetHelperDailyReport from 'hooks/useFetchGetHelperDailyReport'
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
}

const DecreaseDailyReport = () => {
  const [sortJobTitle, setSortJobtitle] = useState([])
  const [printMode, setPrintMode] = useState(false)
  const [priceDisplayOnReport, setPriceDisplayOnReport] = useState(false)
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const optimizationPrintMode = useFetchGetIsOptimizationPrintModeOn()
  const isPriceDisplayOnDailyReportData = useFetchIsPriceDisplayOnDailyReportSetting()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const designerNameForReportType = useFetchGetDesignerNameForReportType()
  const [designerNameForReportTypeData, setDesignerNameForReportTypeData] = useState('NAME')
  const [helperReport, setHelperReport] = useState([])
  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })
  const getHelperDailyReport = useFetchGetHelperDailyReport({
    input: {
      date: date.startDate,
      identity: sortJobTitle,
    }
  })

  useEffect(() => {
    isPriceDisplayOnDailyReportData.refetch()
  }, [date.startDate, sortJobTitle])

  useEffect(() => {
    if (!getHelperDailyReport.loading) {
      const data = idx(getHelperDailyReport, _ => _.data.helperDailyReport)
      setHelperReport(data)
    }
  }, [getHelperDailyReport.loading])

  useEffect(() => {
    if (!designerNameForReportType.loading) {
      const data = idx(designerNameForReportType, _ => _.data.getDesignerNameForReportType)
      setDesignerNameForReportTypeData(data)
    }
  }, [designerNameForReportType.loading])

  useEffect(() => {
    if (!optimizationPrintMode.loading) {
      const data = idx(optimizationPrintMode, _ => _.data.getIsOptimizationPrintModeOn)
      setPrintMode(data)
    }
  }, [optimizationPrintMode.loading])

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
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setPriceDisplayOnReport(isPriceDisplayOnDailyReport)
    }
  }, [isPriceDisplayOnDailyReportData.loading])

  // Autocomplete元件的選項
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()
  const [jobTitle, setJobTitle] = useState([])
  useEffect(() => {
    if (!merchantJobTitlePoint.loading) {
      const title = merchantJobTitlePoint.data.merchantJobTitlePoint
      const array = []
      title.forEach(el => {
        array.push(el.jobTitle)
      })
      setJobTitle(title)
    }
  }, [merchantJobTitlePoint.loading])

  const handleChecked = value => {
    setSortJobtitle(
      value.map(el => {
        return el.id
      })
    )
  }
  return (
    <Page css={styles.root} title="互助日報表">
      <Container maxWidth={false} css={styles.container}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '互助日報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='互助日報表' />
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
        <Grid item className="noprint" style={{ marginBottom: '20px' }}>
          <Autocomplete
            multiple
            options={jobTitle}
            disableCloseOnSelect
            getOptionLabel={option => option.jobTitle}
            onChange={(event, value) => handleChecked(value)}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ color: '#202D50', marginRight: 8 }}
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option.jobTitle}
              </li>
            )}
            renderInput={params => (
              <TextField {...params} variant="outlined" label="人員類別" placeholder="人員名稱" />
            )}
          />
        </Grid>
        {!getHelperDailyReport.loading ? (
          helperReport.length > 0 ? (
            <Grid container spacing={3} className="DecreaseDailyReport">
              <Results
                helperReport={helperReport}
                titleDate={date.endDate}
                priceDisplayOnReport={priceDisplayOnReport}
                designerNameForReportTypeData={designerNameForReportTypeData}
                isMemberShipCardActive={isMemberShipCardActive}
                printMode={printMode}
              />
            </Grid>
          ) : (
            <Typography variant="h3" gutterBottom component="div">
              無資料
            </Typography>
          )
        ) : (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </Page>
  )
}

export default DecreaseDailyReport
