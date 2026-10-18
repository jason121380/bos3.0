import Page from 'components/Page'
import idx from 'idx'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import useFetchDesignerMonthlyReport from 'hooks/useFetchDesignerMonthlyReport'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import { CSVLink } from "react-csv";
import format from 'date-fns/format'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

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
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
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
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])
  return (
    <Page className="ui-root" title="設計師業績月報表">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "flex", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師業績月報表'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='設計師業績月報表' />
        <div className='noprint flex flex-wrap justify-between gap-3'>
          <DateSelector
            date={date}
            attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
            margin
          />
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-5">
            <div className="self-start">
              <div className="divText">排序依序：</div>
              <ToggleGroup
                size="small"
                value={sort}
                onChange={handleToggleButtonChangeSort}
                exclusive
              >
                {sortEnum.map((data, idx) => (
                  <ToggleGroupItem style={{ wordBreak: 'keep-all' }} key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            {
              !isDisplayTogglePerformanceButton && <div className="self-start">
                <div className="divText">業績依據：</div>
                <ReferToggleButton
                  value={performReference}
                  onChange={handleToggleButtonChange}
                />
              </div>
            }
            <CSVLink
              className="noprint"
              data={excelData}
              filename="設計師業績月報表.csv"
            >
              <Button
                disabled={designerMontlyListData.loading || isMemberShipCardActiveData.loading}
                variant="secondary"
              >
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
          </div>
        </div>
        {(!designerMontlyListData.loading && !isMemberShipCardActiveData.loading) ?
          idx(designerMontlyListData, _ => (
            <Results
              setExcelData={setExcelData}
              performReference={performReference}
              designerMontlyListData={designerMontlyListData.data.designerMonthlyReport}
              sort={sort}
              isMemberShipCardActive={isMemberShipCardActive}
            />
          )) : (
            // 載入中：與舊版 CircularProgress 相同時機顯示
            <div className="noprint mt-3" aria-busy="true" aria-label="載入中">
              <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
          )}
      </div>
    </Page>
  )
}
