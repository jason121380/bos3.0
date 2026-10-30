import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { useState, useEffect } from 'react'
// 人員類別多選（Autocomplete）使用 ui/combobox
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
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { EmptyState } from 'ui/empty-state'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import { Autocomplete } from 'ui/combobox'
import QueryFailed from 'components/QueryFailed'

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [date.startDate, sortJobTitle] 變動時執行；isPriceDisplayOnDailyReportData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [date.startDate, sortJobTitle])

  useEffect(() => {
    if (!getHelperDailyReport.loading) {
      const data = idx(getHelperDailyReport, _ => _.data.helperDailyReport)
      setHelperReport(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getHelperDailyReport.loading])

  useEffect(() => {
    if (!designerNameForReportType.loading) {
      const data = idx(designerNameForReportType, _ => _.data.getDesignerNameForReportType)
      setDesignerNameForReportTypeData(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [designerNameForReportType.loading])

  useEffect(() => {
    if (!optimizationPrintMode.loading) {
      const data = idx(optimizationPrintMode, _ => _.data.getIsOptimizationPrintModeOn)
      setPrintMode(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [optimizationPrintMode.loading])

  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading])

  useEffect(() => {
    if (!isPriceDisplayOnDailyReportData.loading) {
      const isPriceDisplayOnDailyReport = idx(
        isPriceDisplayOnDailyReportData,
        _ => _.data.getPriceDisplayOnDailyReportDefault.isHelperPointPriceDisplay
      )
      setPriceDisplayOnReport(isPriceDisplayOnDailyReport)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isPriceDisplayOnDailyReportData.loading])

  // Autocomplete元件的選項
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
  const checkedIcon = <CheckBoxIcon fontSize="small" />
  const merchantJobTitlePoint = useFetchMerchantJobTitlePoint()
  const [jobTitle, setJobTitle] = useState([])
  useEffect(() => {
    // 查詢失敗時 data 為 undefined，不讀欄位（2026/10/28 稽核 B-04）
    if (!merchantJobTitlePoint.loading && idx(merchantJobTitlePoint, _ => _.data.merchantJobTitlePoint)) {
      const title = merchantJobTitlePoint.data.merchantJobTitlePoint
      const array = []
      title.forEach(el => {
        array.push(el.jobTitle)
      })
      setJobTitle(title)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
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
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['dbyesterday', 'yesterday', 'today', 'startDate']}
            onlyStart
            dateChange={value => setDate(value)}
          />
        }
      />
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
                style={{ color: 'rgb(var(--text))', marginRight: 8 }}
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
      {getHelperDailyReport.error ? (
          <QueryFailed onRetry={() => getHelperDailyReport.refetch()} />
        ) : !getHelperDailyReport.loading ? (
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
