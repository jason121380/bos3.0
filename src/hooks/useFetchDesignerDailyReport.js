import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_DAILY_REPORT = gql`
  query FETCH_DESIGNER_DAILY_REPORT($date: DateTime!, $designerIds: [ID]) {
    designerDailyReport(date: $date, designerIds: $designerIds) {
      user {
        id
        name
        nickName
        designerNo
      }
      orderRecord {
        orderId
        designation
        orderNo
        category
        itemName
        fakePerformance
        truthPerformance
        truthPerformanceWithHelperUsage
      }
      currentDay {
        performanceFakeTotal
        performanceTruthTotal
        performanceDesignateTruthTotal
        performanceNonDesignateTruthTotal
        performanceWithSpecialRake
        orderTotalCount
        designateOrderCount
        nonDesignateOrderCount
        productFakeTotal
        productRake
        customerAveragePrice
        orderAveragePrice
        helperRetrievePoint
        helperRetrievePrice
        helperPaidPoint
        walletDeposit
        orderTypeCount
        orderTypeAveragePrice
        customerDesignateCount
        customerNonDesignateCount
        customerTotalCount
        customerAveragePrice
        thirdPartHandlingFee
        deductionItem
        helperPaidPrice
        helperPaidPoint
        helperPaidPriceFromPoint
        helpGetNoPoint
        membershipFakeTotal
        membershipRake
      }
      tillNow {
        performanceFakeTotal
        performanceTruthTotal
        performanceDesignateTruthTotal
        performanceNonDesignateTruthTotal
        performanceWithSpecialRake
        orderTotalCount
        designateOrderCount
        nonDesignateOrderCount
        productFakeTotal
        productRake
        customerAveragePrice
        orderAveragePrice
        helperRetrievePoint
        helperRetrievePrice
        helperPaidPoint
        walletDeposit
        orderTypeCount
        orderTypeAveragePrice
        customerDesignateCount
        customerNonDesignateCount
        customerTotalCount
        customerAveragePrice
        thirdPartHandlingFee
        deductionItem
        helperPaidPrice
        helperPaidPoint
        helperPaidPriceFromPoint
        helpGetNoPoint
        membershipFakeTotal
        membershipRake
      }
      currentTruthSummary
      currentFakeSummary
      isLastPage
      totalPageCount
      currentPageOrder
    }
  }
`
export default function useFetchDesignerReport({ date, designerIds }) {
  return useQuery(FETCH_DESIGNER_DAILY_REPORT, {
    variables: {
      date,
      designerIds,
    },
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchDesignerReportLazy() {
  const [fetchDesignerReportLazy, designerReportLazyData] = useLazyQuery(
    FETCH_DESIGNER_DAILY_REPORT,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return { fetchDesignerReportLazy, designerReportLazyData }
}
