import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import useFetchDesignerMonthlyReport from 'hooks/useFetchDesignerMonthlyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import { CSVLink } from 'react-csv'
import format from 'date-fns/format'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar, PageHeader } from 'ui/page-header'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const sortEnum = [
  { label: '業績', value: 'performance' },
  { label: '設計師', value: 'designer' },
]

export default function Employees() {
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [excelData, setExcelData] = useState([])
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()

  const [date, setDate] = useState({
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
  })

  const [performReference, setPerformReference] = useState('FAKE')
  const [sort, setSort] = useState('performance')

  const designerMontlyListData = useFetchDesignerMonthlyReport({
    dateRange: {
      startDate: date.startDate,
      endDate: date.endDate,
    },
    performanceDisplay: 'TRUTH', // 後端皆會回傳虛實業績，先寫死
  })
  // 隱藏虛實業績切換按鈕 --------------------------------------------------------------------------------
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isDisplayTogglePerformanceButtonData.loading])
  // ---------------------------------------------------------------------------------------------------

  const handleToggleButtonChange = value => {
    value !== null && setPerformReference(value)
  }
  const handleToggleButtonChangeSort = (_event, state) => {
    state !== null && setSort(state)
  }
  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [isMemberShipCardActiveData.loading])
  return (
    <Page className="ui-root" title="設計師業績月報表">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師業績月報表'}
          </div>
          <div className="merchantNamePrint">{'列印時間： ' + format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}</div>
        </div>
        <PageHeader
          title="設計師業績月報表"
          actions={
            <>
              <CSVLink className="noprint" data={excelData} filename="設計師業績月報表.csv">
                <Button disabled={designerMontlyListData.loading || isMemberShipCardActiveData.loading} variant="secondary">
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
              <Button
                disabled={designerMontlyListData.loading || isMemberShipCardActiveData.loading}
                onClick={() => window.print()}
                variant="secondary"
              >
                <Printer strokeWidth={1.75} />
                列印
              </Button>
            </>
          }
        />
        <ReportToolbar
          date={
            <DateSelector
              date={date}
              attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
              dateChange={value => setDate(value)}
            />
          }
          filters={
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-label text-text-secondary">排序依序</span>
                  <ToggleGroup size="small" value={sort} onChange={handleToggleButtonChangeSort} exclusive>
                    {sortEnum.map((data, idx) => (
                      <ToggleGroupItem style={{ wordBreak: 'keep-all' }} key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                        {data.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
                {!isDisplayTogglePerformanceButton && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-label text-text-secondary">業績依據</span>
                    <ReferToggleButton value={performReference} onChange={handleToggleButtonChange} />
                  </div>
                )}
              </div>
            </>
          }
        />
        {designerMontlyListData.error ? (
          <QueryFailed onRetry={() => designerMontlyListData.refetch()} />
        ) : !designerMontlyListData.loading && !isMemberShipCardActiveData.loading ? (
          idx(designerMontlyListData, _ => (
            <Results
              setExcelData={setExcelData}
              performReference={performReference}
              designerMontlyListData={designerMontlyListData.data.designerMonthlyReport}
              sort={sort}
              isMemberShipCardActive={isMemberShipCardActive}
            />
          ))
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint mt-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}
