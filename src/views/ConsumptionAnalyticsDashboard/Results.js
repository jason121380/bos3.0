import { useEffect, useState } from 'react'

import OrderGender from './Charts/OrderGender';
import OrderAgeDistribution from './Charts/OrderAgeDistribution';
import CustomerConsumptionCountRanking from './Charts/CustomerConsumptionCountRanking';
import CustomerConsumptionPriceRanking from './Charts/CustomerConsumptionPriceRanking';
import CustomerConsumptionPricePerCountRanking from './Charts/CustomerConsumptionPricePerCountRanking';
import WeeklyOrderCountRanking from './Charts/WeeklyOrderCountRanking';
import ProductSalesVolumeRanking from './Charts/ProductSalesVolumeRanking';
import ProductSalesPriceRanking from './Charts/ProductSalesPriceRanking';
import PerformanceDetail from './Charts/PerformanceDetail';
import ReturnedRatio from './Charts/ReturnedRatio';
import SourceRatio from './Charts/SourceRatio';
import NewCusStatistics from './Charts/NewCusStatistics';

function Results({
  dashboardData, chartDisplay, dataType, setDataType,
  sortType, setSortType
}) {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleResize = () => {
    setWidth(window.innerWidth)
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&_tspan]:text-[14px] [&_.recharts-legend-item-text]:text-[14px]">

      <PerformanceDetail // 設計師業績趨勢
        data={dashboardData.performanceTrendV2}
        dataType={dataType}
        setDataType={setDataType}
        sortType={sortType}
        setSortType={setSortType}
      />

      <OrderGender // 消費者性別比例
        display={chartDisplay.orderGender}
        data={dashboardData.orderGenderRatio}
        width={width}
      />

      <OrderAgeDistribution // 消費者年齡分佈
        display={chartDisplay.age}
        data={dashboardData.orderAgeDistribution}
        width={width}
      />

      <CustomerConsumptionCountRanking // 消費總次數排行
        data={dashboardData.customerConsumptionCountRanking}
      />

      <CustomerConsumptionPriceRanking // 消費總金額排行 
        data={dashboardData.customerConsumptionPriceRanking}
      />

      <CustomerConsumptionPricePerCountRanking // 消費客單價排行
        data={dashboardData.customerConsumptionPricePerCountRanking}
      />

      <WeeklyOrderCountRanking // 週間來客數排行
        display={chartDisplay.weekly}
        data={dashboardData.weeklyOrderCountRanking}
      />

      <ProductSalesVolumeRanking // 商品銷售數量排行
        data={dashboardData.productSalesVolumeRanking}
      />

      <ProductSalesPriceRanking // 商品銷售金額排行
        data={dashboardData.productSalesPriceRanking}
      />

      <ReturnedRatio // 顧客回流率
        data={dashboardData.returnedRatio}
        width={width}
      />

      <SourceRatio // 顧客來源比例
        data={dashboardData.sourceRatio}
        width={width}
      />

      <NewCusStatistics // 新客比例
        data={dashboardData.newCusStatistics}
        width={width}
      />

    </div>
  )
}

export default Results
