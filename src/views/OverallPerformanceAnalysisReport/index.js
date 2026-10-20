import { useState, useEffect } from 'react'
// 業績包含（多選）切換鈕改 ui/toggle-group（非 exclusive、陣列值原樣傳遞）
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import Page from 'components/Page'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import DateSelector from 'components/DateSelector'
import { endOfMonth, startOfMonth, format } from 'date-fns'
import idx from 'idx'
import { CSVLink } from "react-csv";
import useFetchGetOverallPerformanceAnalysisReport from 'hooks/useFetchGetOverallPerformanceAnalysisReport'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { PageHeader, ReportToolbar } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Results from './Results'

const include = [
  { label: '業績', value: 'SERVICE' },
  { label: '店販', value: 'PRODUCT' },
  { label: '預收卡', value: 'TICKET' },
  { label: '會員卡', value: 'MEMBERSHIP' },
]

const OverallPerformanceAnalysisReport = () => {
  const [excelData, setExcelData] = useState([])
  const [merchantSelect, setMerchantSelect] = useState([])
  const [performanceInclude, setPerformanceInclude] = useState(['SERVICE'])
  const [overAllReport, setOverAllReport] = useState([])
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime(),
  })

  const [getOverallPerformanceAnalysisReportLazy, overallPerformanceAnalysisReportLazyData] = useFetchGetOverallPerformanceAnalysisReport()

  const weekDisplay = week => {
    switch (week) {
      case 'Monday':
        return '(一)'
      case 'Tuesday':
        return '(二)'
      case 'Wednesday':
        return '(三)'
      case 'Thursday':
        return '(四)'
      case 'Friday':
        return '(五)'
      case 'Saturday':
        return '(六)'
      case 'Sunday':
        return '(日)'
      default:
        break
    }
  }

  useEffect(() => {
    getOverallPerformanceAnalysisReportLazy({
      variables: {
        input: {
          storeIds: merchantSelect,
          dateRange: date,
          performanceInclude: performanceInclude,
        },
      },
    })
  }, [date])

  useEffect(() => {
    if (!overallPerformanceAnalysisReportLazyData.loading && overallPerformanceAnalysisReportLazyData.data !== undefined) {
      const reportData = idx(overallPerformanceAnalysisReportLazyData, _ => _.data.overallPerformanceAnalysisReport)
      setOverAllReport(reportData)
      if (!!reportData.merchantNameList) {
        const excelData = []
        reportData.performanceAnalysis.map(data => {
          const obj = {}
          obj['日期'] = `${format(new Date(data.date), 'yyyy/MM/dd')}  ${weekDisplay(format(new Date(data.date), 'eeee'))}`
          data.merchantPerformance.map((d, index) => {
            if (d.merchantName === reportData.merchantNameList[index]) {
              obj[d.merchantName] = d.performance
            } else {
              // 如果資料的順序跟merchantNameList的順序不一樣 就以merchantNameList的順序為主
              const correctData = data.merchantPerformance.filter(d => {
                return d.merchantName === reportData.merchantNameList[index]
              })
              obj[correctData[0].merchantName] = correctData[0].performance
            }
          })
          excelData.push(obj,)
        })

        const summeryObj = { '日期': '區間合計', }
        reportData.performanceSummary.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            summeryObj[d.merchantName] = Math.round(d.performance)
          } else {
            const correctData = reportData.performanceSummary.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            summeryObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(summeryObj)

        const workingDayObj = { '日期': '實際工作天數', }
        reportData.workingDay.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            workingDayObj[d.merchantName] = d.dayCount
          } else {
            const correctData = reportData.workingDay.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            workingDayObj[correctData[0].merchantName] = correctData[0].dayCount
          }
        })
        excelData.push(workingDayObj)

        const averagePerformanceObj = { '日期': '單日平均', }
        reportData.averagePerformance.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            averagePerformanceObj[d.merchantName] = d.performance
          } else {
            const correctData = reportData.averagePerformance.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            averagePerformanceObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(averagePerformanceObj)

        const expectedPerformanceAllMonthObj = { '日期': '當月預估', }
        reportData.expectedPerformanceAllMonth.map((d, index) => {
          if (d.merchantName === reportData.merchantNameList[index]) {
            expectedPerformanceAllMonthObj[d.merchantName] = d.performance
          } else {
            const correctData = reportData.expectedPerformanceAllMonth.filter(d => {
              return d.merchantName === reportData.merchantNameList[index]
            })
            expectedPerformanceAllMonthObj[correctData[0].merchantName] = correctData[0].performance
          }
        })
        excelData.push(expectedPerformanceAllMonthObj)

        setExcelData(excelData)
      }
    }
  }, [overallPerformanceAnalysisReportLazyData.loading])

  const handleToggleButtonChange = (_event, state) => {
    setPerformanceInclude(state)
  }

  const handleChecked = value => {
    if (value.length > 0) {
      setMerchantSelect(value)
    } else if (value.length === 0) {
      setMerchantSelect([])
      getOverallPerformanceAnalysisReportLazy({
        variables: {
          input: {
            storeIds: [],
            dateRange: date,
            performanceInclude: performanceInclude,
          },
        },
      })
    }
  }
  const handleSearchReport = () => {
    getOverallPerformanceAnalysisReportLazy({
      variables: {
        input: {
          storeIds: merchantSelect,
          dateRange: date,
          performanceInclude: performanceInclude,
        },
      },
    })
  }
  return (
    <Page className="ui-root" title="多店業績統計表">
      <PageHeader
        title="多店業績統計表"
        actions={
          <CSVLink data={excelData} filename="多店業績統計表.csv"
            onClick={() => {
              if (overallPerformanceAnalysisReportLazyData.loading ||
                overallPerformanceAnalysisReportLazyData.data === undefined ||
                excelData.length === 0) {
                return false
              }
            }}>
            <Button disabled={overallPerformanceAnalysisReportLazyData.loading ||
              overallPerformanceAnalysisReportLazyData.data === undefined ||
              excelData.length === 0}
              variant="secondary">
              <Download strokeWidth={1.75} />
              報表匯出
            </Button>
          </CSVLink>
        }
      />
      <ReportToolbar
        date={
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate', 'endDate']}
            dateChange={value => setDate(value)}
          />
        }
        filters={
          <>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="text-label text-text-secondary">業績包含</div>
              <ToggleGroup
                size="small"
                value={performanceInclude}
                onChange={handleToggleButtonChange}
              >
                {include.map((data, idx) => (
                  <ToggleGroupItem key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                    {data.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="min-w-0">
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
            className="w-[100px]"
          >
            搜尋
          </Button>
        }
      />
      {!overallPerformanceAnalysisReportLazyData.loading && overallPerformanceAnalysisReportLazyData.data !== undefined ? (
        <Results
          weekDisplay={weekDisplay}
          overAllReport={overAllReport}
        />
      ) : (
        <Skeleton className="h-96" aria-busy="true" />
      )}
    </Page>
  )
}

export default OverallPerformanceAnalysisReport
