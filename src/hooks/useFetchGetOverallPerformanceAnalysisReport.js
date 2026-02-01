import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT = gql`
  query FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT($input: OverallPerformanceAnalysisReportInput!) {
    overallPerformanceAnalysisReport(input: $input) {
      merchantNameList
      performanceAnalysis {
        date
        merchantPerformance {
          merchantName
          performance
        }
      }
      performanceSummary {
        merchantName
        performance
      }
      workingDay {
        merchantName
        dayCount
      }
      averagePerformance {
        merchantName
        performance
      }
      expectedPerformanceAllMonth {
        merchantName
        performance
      }
    }
  }
`

export default function useFetchGetOverallPerformanceAnalysisReport() {
  const [getOverallPerformanceAnalysisReportLazy, overallPerformanceAnalysisReportLazyData] =
    useLazyQuery(FETCH_GET_OVERALL_PERFORMANCE_ANALYSIS_REPORT, {
      fetchPolicy: 'cache-and-network',
    })
  return [getOverallPerformanceAnalysisReportLazy, overallPerformanceAnalysisReportLazyData]
}
