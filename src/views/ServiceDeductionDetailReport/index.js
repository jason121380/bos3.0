import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { useState, useEffect } from 'react'
// 抽成類別的選項含 value={null}（全部），Radix Select 不支援空值，使用 ui/native-select NativeSelect
import MerchantSearchBar from 'components/MerchantSearchBar/index'
import ServicesIncludesTicketsAutoComplete from 'components/ServicesIncludesTicketsAutoComplete'
import { useFetchGetAttributionForRake } from 'hooks/useFetchGetAttribution'
import Page from 'components/Page'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { endOfMonth } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchServiceDedcutionDetailMultiple from 'hooks/useFetchGetUserServiceDeductionDetailMultiple'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Card } from 'ui/card'
import { EmptyState } from 'ui/empty-state'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

// MerchantSearchBar 已使用 flex 排版；下方舊 MuiGrid 後代選擇器目前不命中，保留既有 class 字串
const topDiv = 'flex flex-row flex-wrap items-center gap-2.5 [&_.MuiGrid-container]:!w-[unset]'

const ServiceDeductionDetailReport = () => {
  const getAttributionForRake = useFetchGetAttributionForRake()
  const [attributions, setAttributions] = useState([])
  const [inputData, setInputData] = useState({
    startDate: new Date().getTime(),
    endDate: endOfMonth(new Date()).getTime(),
    employeeId: [],
    serviceId: [],
    rakeWays: [],
  })
  const [excelData, setExcelData] = useState([])
  const serviceDedcutionDetailData = useFetchServiceDedcutionDetailMultiple({
    input: {
      dateRange: {
        startDate: inputData.startDate,
        endDate: inputData.endDate,
      },
      userId: inputData.employeeId !== '' ? inputData.employeeId : [],
      serviceIds: inputData.serviceId !== null ? inputData.serviceId : [],
      rakeWays: inputData.rakeWays,
    },
  })
  const hanldeOnChange = event => {
    if (event.target.value === null) {
      setInputData({ ...inputData, rakeWays: [] })
    } else {
      setInputData({ ...inputData, rakeWays: [event.target.value] })
    }
  }

  useEffect(() => {
    if (!getAttributionForRake.loading) {
      const data = idx(getAttributionForRake, _ => _.data.getAttributionForRake)
      setAttributions(data || [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getAttributionForRake.loading])

  return (
    <Page className="ui-root" title="服務扣項明細表">
      <div>
        <PageHeader title='服務扣項明細表'>
          <Button asChild variant="secondary">
            <CSVLink
              data={excelData}
              filename="服務扣項明細表.csv"
            >
              <Download strokeWidth={1.75} />
              報表匯出
            </CSVLink>
          </Button>
        </PageHeader>
        {/* 日期留在篩選列；其餘條件收進「篩選」（STYLE §14）。MerchantSearchBar 拆兩個實例共用同一份 values（同帳單列表），收合區的那個不讀網址日期 */}
        <ReportToolbar
          date={
            <div className={topDiv}>
              <MerchantSearchBar
                values={inputData}
                onFilter={values => setInputData(values)}
                outside
                visible={['datePicker']}
                lastInLeaderBoard={true}
              />
            </div>
          }
          filters={
            <div className={topDiv}>
              <MerchantSearchBar
                values={inputData}
                onFilter={values => setInputData(values)}
                outside
                stopGetQueryString={true}
                visible={['employee']}
                lastInLeaderBoard={true}
              />
              <ServicesIncludesTicketsAutoComplete
                className="!min-w-[180px]"
                label="服務名稱/代號"
                value={inputData.serviceId}
                name="service"
                onChange={value => {
                  setInputData({ ...inputData, serviceId: value ? value.id : [] })
                }}
              />
              <NativeSelect onChange={event => hanldeOnChange(event)} displayEmpty={false} placeholder="請選擇…" label="抽成類別" fullWidth={false} className="min-w-[120px] align-top !min-w-[180px]">
                <NativeSelectOption value={null}>全部</NativeSelectOption>
                {attributions.map((data, index) => (
                  <NativeSelectOption key={index} value={data.value}>{data.label}</NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          }
        />
        {serviceDedcutionDetailData.error ? (
          <QueryFailed onRetry={() => serviceDedcutionDetailData.refetch()} />
        ) : !serviceDedcutionDetailData.loading ? (
          idx(serviceDedcutionDetailData, _ =>
            _.data.getUserServiceDeductionDetialMultiple !== null ? (
              _.data.getUserServiceDeductionDetialMultiple.length > 0 ? (
                <Results
                  userServiceDeductionDetial={_.data.getUserServiceDeductionDetialMultiple}
                  setExcelData={setExcelData}
                />
              ) : (
                <Card className="mt-3">
                  <EmptyState title="無資料" />
                </Card>
              )
            ) : (
              <Card className="mt-3">
                <EmptyState title="請選擇日期與設計師" />
              </Card>
            )
          )
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="mt-3" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default ServiceDeductionDetailReport
