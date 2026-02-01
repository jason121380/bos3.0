import { useLazyQuery } from '@apollo/client'
import { gql } from 'apollo-boost'

export const FetchDailyMoneyFlowReportV2 = gql`
  query DailyMoneyFlowReportV2($input: ReportInput!) {
    dailyMoneyFlowReportV2(input: $input)
  }
`
export function useFetchDailyMoneyFlowReportV2(startDate, endDate) {
  return useLazyQuery(FetchDailyMoneyFlowReportV2, {
    variables: {
      input: {
        startDate: startDate,
        endDate: endDate,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
