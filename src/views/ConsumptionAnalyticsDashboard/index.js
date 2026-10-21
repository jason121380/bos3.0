import Page from 'components/Page'
import { endOfMonth, startOfMonth, getMonth } from 'date-fns'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { useEffect, useState } from 'react'
import useFetchGetConsumptionAnalyticsDashboard from 'hooks/useFetchGetConsumptionAnalyticsDashboard'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'

import Filter from './Filter'
import Results from './Results'

const monthArr = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

function ConsumptionAnalyticsDashboard() {
  const getIsDisplayTogglePerformanceButton = useFetchGetIsDisplayTogglePerformanceButton()
  const urlParams = new URLSearchParams(window.location.search)
  const [date, setDate] = useState({
    startDate: startOfMonth(new Date()).getTime(),
    endDate: endOfMonth(new Date()).getTime()
  })
  const [getConsumptionAnalyticsDashboardLazy, getConsumptionAnalyticsDashboardLazyData] = useFetchGetConsumptionAnalyticsDashboard()
  const [dashboardData, setDashboardData] = useState({
    orderGenderRatio: [],                         // 消費者性別比例 期間內(訂單)來客的性別比例
    orderAgeDistribution: [],                     // 消費者年齡分佈 期間內(訂單)來客的年齡分佈
    customerConsumptionCountRanking: [],          // 消費總次數排行 期間內來最多次的客人(訂單)
    customerConsumptionPriceRanking: [],          // 消費總金額排行 期間內來客(訂單)的消費總額
    customerConsumptionPricePerCountRanking: [],  // 消費客單價排行 期間內來客(訂單)的消費總額
    weeklyOrderCountRanking: [],                  // 週間來客數排行 期間內星期一到日，訂單數比較
    productSalesVolumeRanking: [],                // 商品銷售數量排行 期間內商品銷售數量排行
    productSalesPriceRanking: [],                 // 商品銷售金額排行 期間內商品銷售金額排行
    sourceRatio: [],                              // 顧客來源比例
    returnedRatio: [],                            // 顧客回流率
    newCusStatistics: [],                         // 新客比例
    // performanceTrend: [],                         // 設計師業績趨勢表
    performanceTrendV2: [],                       // 設計師業績趨勢表v2
  })
  const [chartDisplay, setChartDisplay] = useState({
    orderGender: false,
    age: false,
    weekly: false,
  })
  const [inputData, setInputData] = useState({
    date: {
      startDate: urlParams.has('startDate') && urlParams.has('endDate') ? +urlParams.get('startDate') : startOfMonth(new Date()).getTime(),
      endDate: urlParams.has('startDate') && urlParams.has('endDate') ? +urlParams.get('endDate') : endOfMonth(new Date()).getTime()
    },
    designerIds: [],
    reference: 'FAKE',
    performance: 'SUM'
  })
  const [referDisplay, setReferDisplay] = useState(true)
  const [dataType, setDataType] = useState('designer')
  const [sortType, setSortType] = useState([
    'service',
    'product',
    'ticketSell',
    'ticketUse',
    'membership'
  ])

  useEffect(() => {
    if (!getIsDisplayTogglePerformanceButton.loading) {
      const display = idx(getIsDisplayTogglePerformanceButton, _ => _.data.getIsDisplayTogglePerformanceButton)
      setReferDisplay(display)
    }
  }, [getIsDisplayTogglePerformanceButton.loading])

  useEffect(() => {
    getConsumptionAnalyticsDashboardLazy({
      variables: {
        input: {
          dateRange: inputData.date,
          designerIds: inputData.designerIds,
          displayReference: inputData.reference,
          resultDisplayMode: inputData.performance
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!getConsumptionAnalyticsDashboardLazyData.loading && getConsumptionAnalyticsDashboardLazyData.data !== undefined) {
      const findWeek = week => {
        switch (week) {
          case 'SUNDAY':
            return '(日)'
          case 'MONDAY':
            return '(一)'
          case 'TUESDAY':
            return '(二)'
          case 'WEDNESDAY':
            return '(三)'
          case 'THURSDAY':
            return '(四)'
          case 'FRIDAY':
            return '(五)'
          case 'SATURDAY':
            return '(六)'
          default:
            // 其他值不處理（與原本沒有 default 時相同）
            break
        }
      }
      const orderGenderRatio = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.orderGenderRatio)
      const orderGender = [
        { name: '男', percentage: orderGenderRatio.male.percentage, count: orderGenderRatio.male.count },
        { name: '女', percentage: orderGenderRatio.female.percentage, count: orderGenderRatio.female.count },
        { name: '未知', percentage: orderGenderRatio.unknown.percentage, count: orderGenderRatio.unknown.count },
      ]
      const orderAgeDistribution = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.orderAgeDistribution)
      const customerConsumptionCount = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.customerConsumptionRanking.customerConsumptionCountRanking).slice(0, 10)
      const customerConsumptionPrice = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.customerConsumptionRanking.customerConsumptionPriceRanking).slice(0, 10)
      const customerConsumptionPricePerCount = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.customerConsumptionRanking.customerConsumptionPricePerCountRanking).slice(0, 10)
      // 每筆先複製，下面會補上 name（查詢結果唯讀）
      const weeklyOrderCount = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.weeklyOrderCountRanking).slice(0, 10).map(d => ({ ...d }))
      const productSalesVolume = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.productSalesRanking.productSalesVolumeRanking).slice(0, 10)
      const productSalesPrice = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.productSalesRanking.productSalesPriceRanking).slice(0, 10)
      const sourceRatioData = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.sourceRatio)
      const returnedRatioData = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.returnedRatio)
      const newCusStatistics = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.orderCustomer.newCusStatistics)
      const performanceTrendData = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.performanceTrend)

      const returnedRatioArr = [
        { name: '新客', ...returnedRatioData.new },
        { name: '回流客', ...returnedRatioData.retented },
        { name: '未回流', ...returnedRatioData.unReturned }
      ]

      const tidyData = performanceTrendData.map(({ date, performances }) => {
        const data = { name: monthArr[getMonth(date)] }
        performances.forEach(({ userName, performance }) => {
          if (performances.length === 1 && userName === '') {
            data['全店'] = performance
          } else {
            data[userName] = performance
          }
        });
        return data
      })

      const trendDataV2 = tidyDataV2()

      const genderArr = []
      const ageArr = []
      const weeklyArr = []
      weeklyOrderCount.forEach(d => {
        d.name = findWeek(d.week)
      })
      setDashboardData({
        orderGenderRatio: orderGender,
        orderAgeDistribution: orderAgeDistribution,
        customerConsumptionCountRanking: customerConsumptionCount,
        customerConsumptionPriceRanking: customerConsumptionPrice,
        customerConsumptionPricePerCountRanking: customerConsumptionPricePerCount,
        weeklyOrderCountRanking: weeklyOrderCount,
        productSalesVolumeRanking: productSalesVolume,
        productSalesPriceRanking: productSalesPrice,
        sourceRatio: sourceRatioData,
        returnedRatio: returnedRatioArr,
        newCusStatistics: newCusStatistics,
        // performanceTrend: tidyData,
        performanceTrendV2: trendDataV2,
      })
      orderGender.forEach(d => d.count > 0 && genderArr.push(d.count))
      orderAgeDistribution.forEach(d => d.count > 0 && ageArr.push(d.count))
      weeklyOrderCount.forEach(d => d.orderCount > 0 && weeklyArr.push(d.orderCount))
      setChartDisplay({
        orderGender: genderArr.length > 0,
        age: ageArr.length > 0,
        weekly: weeklyArr.length > 0,
      })
    }
  }, [getConsumptionAnalyticsDashboardLazyData.loading, dataType, sortType])

  useEffect(() => {
    handleSearch()
  }, [date])

  const handleFetchData = (start, end) => {
    getConsumptionAnalyticsDashboardLazy({
      variables: {
        input: {
          dateRange: {
            endDate: end,
            startDate: start
          },
          designerIds: inputData.designerIds,
          displayReference: inputData.reference,
          resultDisplayMode: inputData.performance
        }
      }
    })
  }

  const handleSearch = () => {
    const start = date.startDate
    const end = date.endDate
    if (Math.abs((start - end) / (1000 * 60 * 60 * 24)) > 366) {
      openSnackbar({
        message: '時間區間不得超過一年',
        variant: 'warning',
      })
    } else {
      handleFetchData(start, end)
    }
  }

  const tidyDataV2 = () => {
    const performanceTrendData = idx(getConsumptionAnalyticsDashboardLazyData, _ => _.data.consumptionAnalyticsDashboard.performanceTrend)
    const result = performanceTrendData.map(({ date, performances }) => {
      const data = { name: monthArr[getMonth(date)] }
      if (dataType === 'merchant') {
        const allPerformance = performances.map(({ performanceDetail }) => {
          return sortType.map(key => performanceDetail[key])
        })
        const sum = allPerformance.flat(Infinity).reduce((a, b) => a + b, 0)
        data['全店'] = sum
      } else {
        performances.forEach(({ userName, performanceDetail }) => {
          data[userName] = sortType.map(key => performanceDetail[key]).reduce((a, b) => a + b, 0)
        })
      }
      return data
    })
    return result
  }

  return (
    <Page className="ui-root" title="消費分析儀表板">
      <PageHeader title="消費分析儀表板" />
      <Filter
        loading={getConsumptionAnalyticsDashboardLazyData.loading}
        handleSearch={handleSearch}
        date={date}
        setDate={setDate}
        inputData={inputData}
        setInputData={setInputData}
        referDisplay={referDisplay}
      />
      {getConsumptionAnalyticsDashboardLazyData.loading ?
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-busy="true">
          <Skeleton className="h-[390px] lg:col-span-2" />
          <Skeleton className="h-[390px]" />
          <Skeleton className="h-[390px]" />
        </div> :
        <Results
          dashboardData={dashboardData}
          chartDisplay={chartDisplay}
          inputData={inputData}
          dataType={dataType}
          setDataType={setDataType}
          sortType={sortType}
          setSortType={setSortType}
        />
      }
    </Page>
  )
}

export default ConsumptionAnalyticsDashboard
