import { useLazyQuery } from '@apollo/client'
import { gql } from '@apollo/client'

export const FetchDownloadOrderReport = gql`
  query OrderReport($input: ReportInput!) {
    orderReport(input: $input)
  }
`

export function useFetchDownloadOrderReport(startDate, endDate) {
  return useLazyQuery(FetchDownloadOrderReport, {
    variables: {
      input: {
        startDate: startDate,
        endDate: endDate,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
