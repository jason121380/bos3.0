import React, { useState, useEffect } from 'react'
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { endOfDay, startOfMonth, format } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchMerchantLeaderBoard from 'hooks/useFetchMerchantLeaderBoard'
import useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard from 'hooks/useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import Results from './Results'
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar } from 'ui/page-header'

const isIncludeProductPerformanceValue = [
  { label: '含店販', value: true },
  { label: '不含入店販', value: false },
]
const isIncludeMembershipPerformanceValue = [
  { label: '含會員卡', value: true },
  { label: '不含入會員卡', value: false },
]

const MerchantLeaderBoard = () => {
  const [excelData, setExcelData] = useState([])
  const [performReference, setPerformReference] = useState('FAKE')
  const [isIncludeProductPerformance, setIsIncludeProductPerformanceValue] = useState(false)
  const [isIncludeMembershipPerformance, setIsIncludeMembershipPerformanceValue] = useState(false)
  const [valueSelect, setValueSelect] = useState([])
  const [submitValue, setSubmitValue] = React.useState([])
  const [isSubmit, setIsSubmit] = useState(false)

  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfDay(new Date()).getTime(),
  })

  const merchantLeaderBoard = useFetchMerchantLeaderBoard({
    startDay: date.startDate,
    endDay: date.endDate,
    merchantId: submitValue,
    reference: performReference,
    isIncludeProductPerformance: isIncludeProductPerformance,
    isIncludeMembershipPerformance: isIncludeMembershipPerformance
  })
  // 店家排行榜服務業績月平均是否顯示
  const isMonthlyAverageDisplayForMerchantLeaderBoard = useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard()
  const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
  const [isMemberShipCardActive, setIsMemberShipCardActive] = useState(false)
  const [displayReportWithMembership, setDisplayReportWithMembership] = useState(isMemberShipCardActive)
  const [monthlyAverageDisplayForMerchantLeaderBoard, setMonthlyAverageDisplayForMerchantLeaderBoard] = useState(false)
  useEffect(() => {
    if (!isMemberShipCardActiveData.loading) {
      const isMemberShipCardActive = idx(
        isMemberShipCardActiveData,
        _ => _.data.getIsMemberShipCardActive
      )
      setIsMemberShipCardActive(isMemberShipCardActive)
      setDisplayReportWithMembership(isMemberShipCardActive)
    }
  }, [isMemberShipCardActiveData.loading])
  // 店家排行榜服務業績月平均是否顯示
  useEffect(() => {
    if (!isMonthlyAverageDisplayForMerchantLeaderBoard.loading) {
      const monthlyAverageDisplayForMerchantLeaderBoard = isMonthlyAverageDisplayForMerchantLeaderBoard.data.getIsMonthlyAverageDisplayForMerchantLeaderBoard
      setMonthlyAverageDisplayForMerchantLeaderBoard(monthlyAverageDisplayForMerchantLeaderBoard)
    }
  }, [isMonthlyAverageDisplayForMerchantLeaderBoard.loading]);
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

  useEffect(() => {
    if (!merchantLeaderBoard.loading) {
      const report = idx(merchantLeaderBoard, _ => _.data.merchantLeaderBoard.merchantLeaderBoard)
      if (report.length > 0) {
        const excelData = []
        let isDisplayExcelWithMembership = false
        const isMembershipIsZero = report.filter(result => result.membershipTotal === 0)
        if (isMembershipIsZero.length !== report.length) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else if (isMemberShipCardActive) {
          setDisplayReportWithMembership(true)
          isDisplayExcelWithMembership = true
        } else {
          setDisplayReportWithMembership(false)
          isDisplayExcelWithMembership = false
        }
        const key = performReference === 'FAKE' ? "會員卡業績(虛)" : "會員卡業績(實)"
        const objTotal = {}
        const objTotal2 = {}
        if (isDisplayExcelWithMembership) {
          objTotal[key] = Math.round(report.reduce((acc, curVal) => acc + curVal.membershipTotal, 0))
        }
        if (monthlyAverageDisplayForMerchantLeaderBoard) {
          objTotal2['服務業績月平均'] = Math.round(report.reduce((acc, curVal) => acc + curVal.monthlyAveragePerformance, 0))
        }
        if (performReference === 'FAKE') {
          report.forEach(data => {
            const obj = {}
            const obj2 = {}
            if (isDisplayExcelWithMembership) {
              obj[key] = Math.round(data.membershipTotal)
            }
            if (monthlyAverageDisplayForMerchantLeaderBoard) {
              obj2['服務業績月平均'] = Math.round(data.monthlyAveragePerformance)
            }
            excelData.push({
              所屬店家: data.storeName,
              ...obj2,
              '總業績': Math.round(data.businessPerformanceTotal),
              '服務總業績(虛)': Math.round(data.serviceTotal),
              '服務業績(指)(虛)': Math.round(data.designateServiceTotal),
              '服務業績(不指)(虛)': Math.round(data.nonDesignateServiceTotal),
              '卡券使用業績(虛)': Math.round(data.usedTicketTotal),
              '卡券販賣(入業績)(虛)': Math.round(
                data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
              ),
              '店販業績(虛)': Math.round(data.productTotal),
              ...obj,
              '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(
                data.helperPaidPrice
              )}`,
            })
          })

          excelData.push({
            所屬店家: '合計',
            ...objTotal2,
            '總業績': Math.round(report
              .map(data => data.businessPerformanceTotal)
              .reduce((acc, curVal) => acc + curVal, 0)),
            '服務總業績(虛)': Math.round(report.reduce((acc, curVal) => acc + curVal.serviceTotal, 0)),
            '服務業績(指)(虛)': Math.round(report.reduce((acc, curVal) => acc + curVal.designateServiceTotal, 0)),
            '服務業績(不指)(虛)': Math.round(report.reduce((acc, curVal) => acc + curVal.nonDesignateServiceTotal, 0)),
            '卡券使用業績(虛)': Math.round(report.reduce((acc, curVal) => acc + curVal.usedTicketTotal, 0)),
            '卡券販賣(入業績)(虛)': Math.round(
              report
                .map(
                  data =>
                    data.ticketSellIntoPerformanceDesignate +
                    data.ticketSellIntoPerformanceNonDesignate
                )
                .reduce((acc, curVal) => acc + curVal, 0)
            ),
            '店販業績(虛)': Math.round(
              report.reduce((acc, curVal) => acc + curVal.productTotal, 0)
            ),
            ...objTotal,
            '互助使用(點數)/互助使用(金額)': `${Math.round(
              report.reduce((acc, curVal) => acc + curVal.helperPaidPoint, 0)
            )}/${Math.round(
              report.reduce((acc, curVal) => acc + curVal.helperPaidPrice, 0)
            )}`,
          })
          setExcelData(excelData)
        }
        if (performReference === 'TRUTH') {
          report.forEach(data => {
            const obj = {}
            const obj2 = {}
            if (isDisplayExcelWithMembership) {
              obj[key] = Math.round(data.membershipTotal)
            }
            if (monthlyAverageDisplayForMerchantLeaderBoard) {
              obj2['服務業績月平均'] = Math.round(data.monthlyAveragePerformance)
            }
            excelData.push({
              所屬店家: data.storeName,
              ...obj2,
              '總業績': Math.round(data.monthlyAveragePerformance),
              '服務總業績(實)': Math.round(data.serviceTotal),
              '服務業績(指)(實)': Math.round(data.designateServiceTotal),
              '服務業績(不指)(實)': Math.round(data.nonDesignateServiceTotal),
              '卡券使用業績(實)': Math.round(data.usedTicketTotal),
              '卡券販賣(入業績)(實)': Math.round(
                data.ticketSellIntoPerformanceDesignate + data.ticketSellIntoPerformanceNonDesignate
              ),
              '店販業績 (實)': Math.round(data.productTotal),
              ...obj,
              '互助使用(點數)/互助使用(金額)': `${Math.round(data.helperPaidPoint)}/${Math.round(
                data.helperPaidPrice
              )}`,
            })
          })
          excelData.push({
            所屬店家: '合計',
            ...objTotal2,
            '總業績': Math.round(report
              .map(data => data.businessPerformanceTotal)
              .reduce((acc, curVal) => acc + curVal, 0)),
            '服務總業績(實)': Math.round(report.reduce((acc, curVal) => acc + curVal.serviceTotal, 0)),
            '服務業績(指)(實)': Math.round(report.reduce((acc, curVal) => acc + curVal.designateServiceTotal, 0)),
            '服務業績(不指)(實)': Math.round(report.reduce((acc, curVal) => acc + curVal.nonDesignateServiceTotal, 0)),
            '卡券使用業績(實)': Math.round(report.reduce((acc, curVal) => acc + curVal.usedTicketTotal, 0)),
            '卡券販賣(入業績)(實)': Math.round(
              report
                .map(
                  data =>
                    data.ticketSellIntoPerformanceDesignate +
                    data.ticketSellIntoPerformanceNonDesignate
                )
                .reduce((acc, curVal) => acc + curVal, 0)
            ),
            '店販業績 (實)': Math.round(report.reduce((acc, curVal) => acc + curVal.productTotal, 0)),
            ...objTotal,
            '互助使用(點數)/互助使用(金額)': `${Math.round(
              report.reduce((acc, curVal) => acc + curVal.helperPaidPoint, 0)
            )}/${Math.round(
              report.reduce((acc, curVal) => acc + curVal.helperPaidPrice, 0)
            )}`,
          })
          setExcelData(excelData)
        }
      }
    }
  }, [merchantLeaderBoard.loading, valueSelect, isIncludeMembershipPerformance, isMemberShipCardActive])

  const handleToggleButtonChange = value => {
    value && setPerformReference(value)
  }
  const handleProductPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeProductPerformanceValue(state)
  }
  const handleMembershipPerformanceToggleButtonChange = (_event, state) => {
    state !== null && setIsIncludeMembershipPerformanceValue(state)
  }

  useEffect(() => {
    if (date && valueSelect.length > 0) {
      setIsSubmit(true)
      setSubmitValue(valueSelect)
    }
  }, [date])

  const handleChecked = value => {
    if (value.length > 0) {
      setValueSelect(value)
    } else if (value.length === 0) {
      setValueSelect([])
      setIsSubmit(false)
    }
  }

  const handleSearchReport = () => {
    if (valueSelect.length > 0 && valueSelect !== undefined) {
      setSubmitValue(valueSelect)
      setIsSubmit(true)
    } else {
      setSubmitValue([])
      setIsSubmit(false)
    }
  }

  return (
    <Page className='MerchantLeaderBoard ui-root' title="店家排行榜">
      <div>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM-dd').toLocaleString() +
              '  - ' +
              format(new Date(date.endDate), 'yyyy-MM-dd').toLocaleString() +
              '   ' +
              '店家排行榜'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <AdminPageHeader title='店家排行榜'>
          <CSVLink data={excelData} filename="店家排行榜.csv">
            <Button variant="secondary" disabled={merchantLeaderBoard.loading}>
              <Download strokeWidth={1.75} />
              報表匯出
            </Button>
          </CSVLink>
          <Button
            variant="secondary"
            disabled={merchantLeaderBoard.loading}
            onClick={() => window.print()}
          >
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        </AdminPageHeader>
        <ReportToolbar
          date={
            <DateSelector
              date={date}
              attributes={[
                'thismonth', 'lastmonth', 'dbyesterday',
                'yesterday', 'today', 'startDate', 'endDate'
              ]}
              dateChange={value => setDate(value)}
            />
          }
          filters={
            <>
              {!isDisplayTogglePerformanceButton && <div className="flex flex-col gap-1.5">
                <span className="text-label text-text-secondary">業績依據</span>
                <ReferToggleButton
                  value={performReference}
                  onChange={handleToggleButtonChange}
                />
              </div>}
              <div className="flex flex-col gap-1.5">
                <span className="text-label text-text-secondary">總業績依據</span>
                <div className="flex flex-wrap gap-2.5">
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
                  {displayReportWithMembership &&
                    <ToggleGroup
                      size="small"
                      value={isIncludeMembershipPerformance}
                      onChange={handleMembershipPerformanceToggleButtonChange}
                      exclusive
                    >
                      {isIncludeMembershipPerformanceValue.map((data, idx) => (
                        <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                          {data.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>}
                </div>
              </div>
              <div className="min-w-0 flex-1">
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
              className="w-[100px] shrink-0"
            >
              搜尋
            </Button>
          }
        />
        {!merchantLeaderBoard.loading && !isMonthlyAverageDisplayForMerchantLeaderBoard.loading && !isMemberShipCardActiveData.loading ? (
          <Results
            performReference={performReference}
            merchantLeaderBoard={idx(merchantLeaderBoard, _ => _.data.merchantLeaderBoard)}
            isSubmit={isSubmit}
            monthlyAverageDisplayForMerchantLeaderBoard={
              monthlyAverageDisplayForMerchantLeaderBoard
            }
            displayReportWithMembership={displayReportWithMembership}
            isIncludeMembershipPerformance={isIncludeMembershipPerformance}
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

export default MerchantLeaderBoard
