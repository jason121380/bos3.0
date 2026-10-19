/** @jsxImportSource @emotion/react */
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
// 人員類別多選（Autocomplete）保留 MUI
import Page from 'components/Page'
import DateSelector from 'components/DateSelector'
import { format } from 'date-fns'
import idx from 'idx'
import useFetchIsPriceDisplayOnDailyReportSetting from 'hooks/useFetchIsPriceDisplayOnDailyReport'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import useFetchMerchantJobTitlePoint from 'hooks/useFetchMerchantJobTitlePoint'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsOptimizationPrintModeOn from 'hooks/useFetchGetIsOptimizationPrintModeOn'
import useFetchGetDesignerNameForReportType from 'hooks/useFetchGetDesignerNameForReportType'
import useFetchGetHelperDailyReport from 'hooks/useFetchGetHelperDailyReport'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'
import { PageHeader, Toolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { Autocomplete } from 'ui/combobox'

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
    <Page className="ui-root" title="互助日報表">
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
      <PageHeader
        title="互助日報表"
        actions={
          <Button className="noprint" variant="secondary" onClick={() => window.print()}>
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        }
      />
      <Toolbar>
        <DateSelector
          date={date}
          attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
          onlyStart
          dateChange={value => setDate(value)}
        />
      </Toolbar>
      <div className="noprint pb-6">
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
      </div>
      {!getHelperDailyReport.loading ? (
        helperReport.length > 0 ? (
          <div className="DecreaseDailyReport grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 print:block">
            <Results
              helperReport={helperReport}
              titleDate={date.endDate}
              priceDisplayOnReport={priceDisplayOnReport}
              designerNameForReportTypeData={designerNameForReportTypeData}
              isMemberShipCardActive={isMemberShipCardActive}
              printMode={printMode}
            />
          </div>
        ) : (
          <EmptyState title="無資料" />
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      )}
    </Page>
  )
}

export default DecreaseDailyReport
