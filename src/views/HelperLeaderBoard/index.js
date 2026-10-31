import { useState, useEffect } from 'react'
import Page from 'components/Page'
import MerchantListAutocomplete from 'components/MerchantListAutocomplete'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth, format } from 'date-fns'
import idx from 'idx'
import { CSVLink } from 'react-csv'
import produce from 'immer'
import useFetchHelperLeaderboard from 'hooks/useFetchHelperLeaderboard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import Results from './Results'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar, PageHeader } from 'ui/page-header'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import QueryFailed from 'components/QueryFailed'

const HelperLeaderBoard = () => {
  const [reportForDisplay, setReportForDisplay] = useState(null)
  const [excelData, setExcelData] = useState([])
  const [displayReportWithMembership, setDisplayReportWithMembership] = useState(false)
  const [sort, setSort] = useState([])
  const [inputValue, setInputValue] = useState({
    startDay: startOfMonth(new Date()).getTime(),
    endDay: endOfDay(new Date()).getTime(),
    merchantId: [],
    reference: 'FAKE',
    orderBy: 'POINT',
  })
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const helperLeaderboardData = useFetchHelperLeaderboard(inputValue)
  // 隱藏虛實業績切換按鈕 --------------------------------------------------------------------------------
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(true)

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isDisplayTogglePerformanceButtonData.loading])
  // ---------------------------------------------------------------------------------------------------

  useEffect(() => {
    if (!helperLeaderboardData.loading && !isMemberShipCardActiveData.loading) {
      const usersReport = idx(helperLeaderboardData, _ => _.data.helperLeaderboard)
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      if (usersReport) {
        const excelData = []
        let isDisplayExcelWithMembership = false
        const isMembershipIsZero = usersReport.filter(result => result.membershipTotal === 0)
        if (isMembershipIsZero.length !== usersReport.length) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else if (isMemberShipCardActive) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else {
          setDisplayReportWithMembership(false)
          isDisplayExcelWithMembership = false
        }
        setReportForDisplay(usersReport)
        const key = inputValue.reference === 'TRUTH' ? '店販業績 (實)' : '店販業績 (虛)'
        const key2 = inputValue.reference === 'TRUTH' ? '會員卡業績 (實)' : '會員卡業績 (虛)'
        usersReport.forEach(data => {
          const obj = {}
          obj[key] = Math.round(data.productTotal)
          if (isDisplayExcelWithMembership) {
            obj[key2] = Math.round(data.membershipTotal)
          }
          excelData.push({
            設計師: data.userName,
            所屬店家: data.storeName,
            '互助獲得(點數)': Math.round(data.helperReceivedPoint),
            '互助使用(點數)': Math.round(data.helperReceivedPrice),
            ...obj,
          })
        })
        const obj = {}
        obj[key] = Math.round(usersReport.reduce((accu, curVal) => accu + curVal.productTotal, 0))
        if (isDisplayExcelWithMembership) {
          obj[key2] = Math.round(usersReport.reduce((accu, curVal) => accu + curVal.membershipTotal, 0))
        }
        excelData.push({
          設計師: '合計',
          '互助獲得(點數)': Math.round(usersReport.reduce((accu, curVal) => accu + curVal.helperReceivedPoint, 0)),
          '互助使用(點數)': Math.round(usersReport.reduce((accu, curVal) => accu + curVal.helperReceivedPrice, 0)),
          ...obj,
        })
        setExcelData(excelData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [helperLeaderboardData.loading, isMemberShipCardActiveData.l…] 變動時執行；helperLeaderboardData、inputValue.reference、isMemberShipCardActiveData 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [helperLeaderboardData.loading, isMemberShipCardActiveData.loading])

  const handleSearchReport = () => {
    handleValueChange('merchantId', sort)
  }

  const handleValueChange = (key = null, value, isDate = false) => {
    setInputValue(
      produce(draft => {
        if (isDate) {
          draft.startDay = value.startDate
          draft.endDay = value.endDate
        } else {
          draft[key] = value
        }
      })
    )
  }

  // 處理欄位的value
  const getSubmitValue = v => {
    if (v.length === 0) {
      setSort([])
      handleValueChange('merchantId', [])
    } else {
      setSort(v)
    }
  }

  useEffect(() => {
    handleSearchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（handleSearchReport）；只在 [inputValue.startDay, inputValue.endDay] 變動時呼叫，補上會每次 render 重跑
  }, [inputValue.startDay, inputValue.endDay])

  return (
    <Page className="HelperLeaderBoard ui-root" title="互助排行榜">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'none', justifyContent: 'space-between' }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(inputValue.startDay), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(inputValue.endDay), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '互助排行榜'}
          </div>
          <div className="merchantNamePrint">{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>
        </div>
        <PageHeader
          title="互助排行榜"
          actions={
            <>
              <CSVLink data={excelData} filename="互助排行榜.csv" style={{ display: 'inline' }}>
                <Button variant="secondary">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
              <Button onClick={() => window.print()} variant="secondary">
                <Printer strokeWidth={1.75} />
                列印
              </Button>
            </>
          }
        />
        <ReportToolbar
          date={
            <DateSelector
              date={{ startDate: inputValue.startDay, endDate: inputValue.endDay }}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => handleValueChange(undefined, value, true)}
            />
          }
          filters={
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-label text-text-secondary">排序依據</span>
                <ToggleGroup size="small" exclusive value={inputValue.orderBy} onChange={(e, v) => handleValueChange('orderBy', v)}>
                  <ToggleGroupItem value="POINT">依點數</ToggleGroupItem>
                  <ToggleGroupItem value="PRICE">依金額</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {!isDisplayTogglePerformanceButton && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary">業績依據</span>
                  <ReferToggleButton value={inputValue.reference} onChange={value => value && handleValueChange('reference', value)} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <MerchantListAutocomplete
                  onValueChange={value => {
                    getSubmitValue(value)
                  }}
                />
              </div>
            </>
          }
          actions={
            <Button variant="primary" onClick={handleSearchReport} className="w-[100px] shrink-0">
              搜尋
            </Button>
          }
        />

        {helperLeaderboardData.error ? (
          <QueryFailed onRetry={() => helperLeaderboardData.refetch()} />
        ) : helperLeaderboardData.loading ? (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint mt-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        ) : reportForDisplay !== null && inputValue.merchantId.length > 0 ? (
          <Results report={reportForDisplay} performReference={inputValue.reference} displayReportWithMembership={displayReportWithMembership} />
        ) : (
          ''
        )}
      </div>
    </Page>
  )
}

export default HelperLeaderBoard
