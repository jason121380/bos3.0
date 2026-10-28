import { useState, useEffect } from 'react'
import Page from 'components/Page'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth, format, isSameDay } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchDesignersLeaderboard from 'hooks/useFetchDesignersLeaderboard'
import useFetchMonthlyAverageDisplayForDesignerLeaderBoard from 'hooks/useFetchGetMonthlyAverageDisplayForDesignerLeaderBoard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import { useFetchGetDRRDataDisplay } from 'hooks/useFetchGetParameterReportSetting'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'

const isIncludeProductPerformanceValue = [
  { label: '含店販', value: true },
  { label: '不含入店販', value: false },
]
const isIncludeMemberPerformanceValue = [
  { label: '含會員卡', value: true },
  { label: '不含會員卡', value: false },
]
const DesignerPerformBasic = () => {
  const [excelData, setExcelData] = useState([])
  const [performReference, setPerformReference] = useState('FAKE')
  const [isIncludeProductPerformance, setIsIncludeProductPerformanceValue] = useState(false)
  const [isIncludeMemberPerformance, setIsIncludeMemberPerformanceValue] = useState(false)
  const [monthlyAveragePerformanceTotal, setMonthlyAveragePerformanceTotal] = useState(0)
  const [submitValue, setSubmitValue] = useState([])
  const [isSubmit, setIsSubmit] = useState(false)
  const [valueSelect, setValueSelect] = useState([])
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)
  const [performanceDisplay, setPerformanceDisplay] = useState('VISIBLE')
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })
  const [
    monthlyAverageDisplayForDesignerLeaderBoard,
    setMonthlyAverageDisplayForDesignerLeaderBoard,
  ] = useState(false)
  const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)
  const [dataDisplay, setDataDisplay] = useState({
    isDRROCDisplay: false,
    isDRRPEVDisplay: false,
  })

  const designersLeaboardData = useFetchDesignersLeaderboard({
    startDay: date.startDate,
    endDay: date.endDate,
    merchantId: submitValue,
    reference: performReference,
    isIncludeProductPerformance: isIncludeProductPerformance,
    isIncludeMembershipPerformance: isIncludeMemberPerformance
  })
  const monthlyAverageDisplayForDesignerLeaderBoardData = useFetchMonthlyAverageDisplayForDesignerLeaderBoard()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const getDRRDataDisplay = useFetchGetDRRDataDisplay()
  const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()

  useEffect(() => {
    if (!getDRRDataDisplay.loading) {
      const { isDRROCDisplay, isDRRPEVDisplay } = idx(getDRRDataDisplay, _ => _.data.getParameterReportSetting) || {}
      setDataDisplay({
        isDRROCDisplay,
        isDRRPEVDisplay
      })
    }
  }, [getDRRDataDisplay.loading])

  useEffect(() => {
    if (!isDisplayTogglePerformanceButtonData.loading) {
      const isDisplayTogglePerformanceButton = idx(
        isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
      setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
    }
  }, [isDisplayTogglePerformanceButtonData.loading])

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
    if (!monthlyAverageDisplayForDesignerLeaderBoardData.loading) {
      const monthlyAverageDisplayForDesignerLeaderBoard = idx(
        monthlyAverageDisplayForDesignerLeaderBoardData,
        _ => _.data.getMonthlyAverageDisplayForDesignerLeaderBoard
      )
      setMonthlyAverageDisplayForDesignerLeaderBoard(monthlyAverageDisplayForDesignerLeaderBoard)
    }
  }, [monthlyAverageDisplayForDesignerLeaderBoardData.loading])

  useEffect(() => {
    if (!designersLeaboardData.loading && !monthlyAverageDisplayForDesignerLeaderBoardData.loading && !isMemberShipCardActiveData.loading) {
      const report = idx(designersLeaboardData, _ => _.data.designerLeaderboard.designerLeaderBoard)
      // 查詢失敗時沒有資料，不整理報表（畫面另有 QueryFailed）
      if (!report) return
      const excelData = []
      const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
      const monthlyAveragePerformanceTotal = idx(
        designersLeaboardData,
        _ => _.data.designerLeaderboard.monthlyAveragePerformanceTotal
      )
      const averageDisplay = idx(
        monthlyAverageDisplayForDesignerLeaderBoardData,
        _ => _.data.getMonthlyAverageDisplayForDesignerLeaderBoard
      )
      const membershipTotal = (report || []).reduce((acc, curVal) => acc + curVal.membershipTotal, 0)
      const membershipDisplay = (isMemberShipCardActive || membershipTotal !== 0)
      
      // 是否顯示會員卡欄位
      setMembershipDisplay(isMemberShipCardActive || membershipTotal !== 0)
      
      const handleCountSummary = key => {
        return Math.round(report.reduce((acc, cur) => acc + cur[key], 0))
      }

      const deleteKey = (data) => {
        if (!membershipDisplay) {
          delete data['會員卡業績(虛)']
          delete data['會員卡業績(實)']
        }
        if (!averageDisplay) {
          delete data['服務業績月平均']
        }
        if (!dataDisplay.isDRRPEVDisplay) {
          delete data['業績預估值']
        }
        if (!dataDisplay.isDRROCDisplay) {
          delete data['客次數']
        }
        if (performanceDisplay !== 'VISIBLE') {
          delete data['服務業績(指)(實)']
          delete data['服務業績(指)(虛)']
          delete data['服務業績(不指)(實)']
          delete data['服務業績(不指)(虛)']
        }
      }
      if (performReference === 'FAKE') {
        report.forEach(data => {
          const currentData = {
            設計師: data.userName,
            所屬店家: data.storeName,
            總業績: Math.round(data.businessPerformanceTotal),
            服務業績月平均: Math.round(data.monthlyAveragePerformance),
            業績預估值: Math.round(data.performanceEV),
            '服務總業績(虛)': Math.round(data.serviceTotal),
            '服務業績(指)(虛)': Math.round(data.designateServiceTotal),
            '服務業績(不指)(虛)': Math.round(data.nonDesignateServiceTotal),
            '卡券使用業績(虛)': Math.round(data.usedTicketTotal),
            '卡券販賣(入業績)(虛)': Math.round(
              data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
            ),
            '店販業績 (虛)': Math.round(data.productTotal),
            '會員卡業績(虛)': Math.round(data.membershipTotal),
            '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(data.helperPaidPrice)}`,
            客次數: data.orderCount,
          }

          deleteKey(currentData)

          excelData.push(currentData)
        })
        const totalData = {
          設計師: '合計',
          所屬店家: '',
          總業績: handleCountSummary('businessPerformanceTotal'),
          服務業績月平均: handleCountSummary('monthlyAveragePerformance'),
          業績預估值: handleCountSummary('performanceEV'),
          '服務總業績(虛)': handleCountSummary('serviceTotal'),
          '服務業績(指)(虛)': handleCountSummary('designateServiceTotal'),
          '服務業績(不指)(虛)': handleCountSummary('nonDesignateServiceTotal'),
          '卡券使用業績(虛)': handleCountSummary('usedTicketTotal'),
          '卡券販賣(入業績)(虛)': handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
          '店販業績 (虛)': handleCountSummary('productTotal'),
          '會員卡業績(虛)': handleCountSummary('membershipTotal'),
          '互助使用(點數)/互助使用(金額)': `${handleCountSummary('helperPaidPoint')}/${handleCountSummary('helperPaidPrice')}`,
          客次數: handleCountSummary('orderCount'),
        }

        deleteKey(totalData)

        excelData.push(totalData)
      } else {
        report.forEach(data => {
          const currentData = {
            設計師: data.userName,
            所屬店家: data.storeName,
            總業績: Math.round(data.businessPerformanceTotal),
            服務業績月平均: Math.round(data.monthlyAveragePerformance),
            業績預估值: Math.round(data.performanceEV),
            '服務總業績(實)': Math.round(data.serviceTotal),
            '服務業績(指)(實)': Math.round(data.designateServiceTotal),
            '服務業績(不指)(實)': Math.round(data.nonDesignateServiceTotal),
            '卡券使用業績(實)': Math.round(data.usedTicketTotal),
            '卡券販賣(入業績)(實)': Math.round(
              data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
            ),
            '店販業績 (實)': Math.round(data.productTotal),
            '會員卡業績(實)': Math.round(data.membershipTotal),
            '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(
              data.helperPaidPrice
            )}`,
            客次數: data.orderCount,
          }

          deleteKey(currentData)

          excelData.push(currentData)
        })
        const totalData = {
          設計師: '合計',
          所屬店家: '',
          總業績: handleCountSummary('businessPerformanceTotal'),
          服務業績月平均: handleCountSummary('monthlyAveragePerformance'),
          業績預估值: handleCountSummary('performanceEV'),
          '服務總業績(實)': handleCountSummary('serviceTotal'),
          '服務業績(指)(實)': handleCountSummary('designateServiceTotal'),
          '服務業績(不指)(實)': handleCountSummary('nonDesignateServiceTotal'),
          '卡券使用業績(實)': handleCountSummary('usedTicketTotal'),
          '卡券販賣(入業績)(實)': handleCountSummary('ticketSellIntoPerformanceDesignate') + handleCountSummary('ticketSellIntoPerformanceNonDesignate'),
          '店販業績 (實)': handleCountSummary('productTotal'),
          '會員卡業績(實)': handleCountSummary('membershipTotal'),
          '互助使用(點數)/互助使用(金額)': `${handleCountSummary('helperPaidPoint')}/${handleCountSummary('helperPaidPrice')}`,
          客次數: handleCountSummary('orderCount'),
        }

        deleteKey(totalData)

        excelData.push(totalData)
      }

      setExcelData(excelData)
      setMonthlyAveragePerformanceTotal(monthlyAveragePerformanceTotal)
    }
  }, [
    designersLeaboardData.loading,
    performReference,
    membershipDisplay,
    monthlyAverageDisplayForDesignerLeaderBoardData.loading,
    isMemberShipCardActiveData.loading,
    dataDisplay,
    performanceDisplay
  ])

  useEffect(() => {
    if (date && valueSelect.length > 0) {
      setIsSubmit(true)
      setSubmitValue(valueSelect)
    }
  }, [date])

  const handleSearchReport = () => {
    if (valueSelect.length > 0 && valueSelect !== undefined) {
      setSubmitValue(valueSelect)
      setIsSubmit(true)
    } else {
      setSubmitValue([])
      setIsSubmit(false)
    }
  }

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }
  const handleProductPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeProductPerformanceValue(state)
  }
  const handleMemberPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeMemberPerformanceValue(state)
  }
  // 處理欄位的value
  const handleChecked = value => {
    if (value.length > 0) {
      setValueSelect(value)
    } else if (value.length === 0) {
      setValueSelect([])
      setIsSubmit(false)
    }
  }

  return (
    <Page className='DesignerPerformBasic ui-root' title="設計師排行榜">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '設計師排行榜'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        {/* 頁首只放「報表匯出」「列印」（STYLE §14）；有資料才顯示，與原本相同 */}
        <PageHeader
          title='設計師排行榜'
          actions={excelData.length !== 0 ? (
            <>
              <CSVLink
                data={excelData}
                filename="設計師排行榜.csv"
                style={{ display: 'inline' }}
              >
                <Button variant="secondary" disabled={designersLeaboardData.loading}>
                  <Download strokeWidth={1.75} />
                  報表匯出
                </Button>
              </CSVLink>
              <Button
                variant="secondary"
                disabled={designersLeaboardData.loading}
                onClick={() => window.print()}
              >
                <Printer strokeWidth={1.75} />
                列印
              </Button>
            </>
          ) : null}
        />
        {/* 日期留在篩選列、搜尋在右側；其餘條件收進「篩選」，標籤在上（STYLE §14） */}
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
              <div className="noprint flex min-w-0 flex-col gap-1.5">
                <div className="text-label text-text-secondary">服務業績指定/不指定：</div>
                <ToggleGroup
                  size="small"
                  exclusive
                  value={performanceDisplay}
                  onChange={(e, v) => v && setPerformanceDisplay(v)}
                >
                  <ToggleGroupItem value='VISIBLE'>顯示</ToggleGroupItem>
                  <ToggleGroupItem value='HIDDEN'>不顯示</ToggleGroupItem>
                </ToggleGroup>
              </div>
              {!isDisplayTogglePerformanceButton && <div className="noprint flex min-w-0 flex-col gap-1.5">
                <div className="text-label text-text-secondary">業績依據：</div>
                <ReferToggleButton
                  value={performReference}
                  onChange={handleToggleButtonChange}
                />
              </div>}
              <div className="noprint flex min-w-0 flex-col gap-1.5">
                <div className="text-label text-text-secondary">
                  總業績依據：
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ToggleGroup
                    size="small"
                    value={isIncludeProductPerformance}
                    onChange={handleProductPerformanceToggleButtonChange}
                    exclusive
                  >
                    {isIncludeProductPerformanceValue.map((data, idx) => (
                      <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                        {data.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {isMemberShipCardActive ?
                    <ToggleGroup
                      size="small"
                      value={isIncludeMemberPerformance}
                      onChange={handleMemberPerformanceToggleButtonChange}
                      exclusive
                    >
                      {isIncludeMemberPerformanceValue.map((data, idx) => (
                        <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                          {data.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup> :
                    membershipDisplay ?
                      <ToggleGroup
                        size="small"
                        value={isIncludeMemberPerformance}
                        onChange={handleMemberPerformanceToggleButtonChange}
                        exclusive
                      >
                        {isIncludeMemberPerformanceValue.map((data, idx) => (
                          <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                            {data.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup> : ''
                  }

                </div>
              </div>
              <div className="noprint min-w-0">
                <MerchantListAutocpmplete
                  onValueChange={value => {
                    handleChecked(value)
                  }}
                />
              </div>
            </>
          }
          actions={
            <Button
              variant="primary"
              onClick={handleSearchReport}
              className="shrink-0"
            >
              搜尋
            </Button>
          }
        />
        {designersLeaboardData.error ? (
          <QueryFailed onRetry={() => designersLeaboardData.refetch()} />
        ) : !designersLeaboardData.loading && !monthlyAverageDisplayForDesignerLeaderBoard.loading ? (
          <Results
            report={idx(designersLeaboardData, _ => _.data.designerLeaderboard.designerLeaderBoard)}
            performReference={performReference}
            monthlyAveragePerformanceTotal={monthlyAveragePerformanceTotal}
            monthlyAverageDisplayForDesignerLeaderBoard={
              monthlyAverageDisplayForDesignerLeaderBoard
            }
            isSubmit={isSubmit}
            membershipDisplay={membershipDisplay}
            setMembershipDisplay={setMembershipDisplay}
            dataDisplay={dataDisplay}
            performanceDisplay={performanceDisplay}
          />
        ) : (
          // 載入中：與舊版 CircularProgress 相同時機顯示
          <div className="noprint" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </div>
        )}
      </div>
    </Page>
  )
}

export default DesignerPerformBasic
