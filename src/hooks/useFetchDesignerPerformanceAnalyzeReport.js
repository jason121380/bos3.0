import { gql, useLazyQuery } from '@apollo/client'

const GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT = gql`
  query GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT($input: DateTimeInput!, $designerIds: [ID], $displayReference: DisplayReferenceEnum) {
    designerPerforamnceAnalyzeReport(input: $input, designerIds: $designerIds, displayReference: $displayReference) {
      designerName
      merchantName
      totalPerformance
      totalOrderCount
      orderAveragePrice
      orderDesignateCount
      orderDesignatePercentage
      orderNonDesignateCount
      orderNonDesignatePercentage
      productPerformance
      productPerformancePercentage
      membershipPerformance
      membershipPerformancePercentage
      serviceTypeAnalyze {
        typeName
        orderTypeCount
        orderTypePercentage
        orderTypeDesignateCount
        orderTypeDesignatePercentage
        orderTypeNonDesignateCount
        orderTypeNonDesignatePercentage
        currentOrderTypePerformance
        currentOrderTypePerformancePercentage
        currentOrderTypeAveragePrice
      }
    }
  }
`

export default function useFetchDesignerPerformanceAnalyzeReport() {
  const [getAnalyzeReport, analyzeReport] = useLazyQuery(GET_DESIGNER_PEROFRMSNCE_ANALYZE_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
  return [getAnalyzeReport, analyzeReport]
}

const GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT = gql`
  query GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT($input: [AnalyzeCompareReportInput]!) {
    designerPerforamnceAnalyzeCompareReport(input: $input) {
      designerName
      merchantName
      totalPerformance
      totalOrderCount
      orderAveragePrice
      orderDesignateCount
      orderDesignatePercentage
      orderNonDesignateCount
      orderNonDesignatePercentage
      productPerformance
      productPerformancePercentage
      membershipPerformance
      membershipPerformancePercentage
      serviceTypeAnalyze {
        typeName
        orderTypeCount
        orderTypePercentage
        orderTypeDesignateCount
        orderTypeDesignatePercentage
        orderTypeNonDesignateCount
        orderTypeNonDesignatePercentage
        currentOrderTypePerformance
        currentOrderTypePerformancePercentage
        currentOrderTypeAveragePrice
      }
    }
  }
`

export function useFetchDesignerPerformanceAnalyzeCompareReport() {
  const [getAnalyzeCompareReport, analyzeCompareReport] = useLazyQuery(GET_DESIGNER_PEROFRMSNCE_ANALYZE_COMPARE_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
  return [getAnalyzeCompareReport, analyzeCompareReport]
}
