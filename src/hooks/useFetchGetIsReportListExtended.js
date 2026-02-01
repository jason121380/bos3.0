import { gql, useQuery } from '@apollo/client'

export const GET_IS_REPORT_LIST_EXTENDED = gql`
  query GET_IS_REPORT_LIST_EXTENDED {
    getIsReportListExtended
  }
`

export default function useFetchGetIsReportListExtended() {
  return useQuery(GET_IS_REPORT_LIST_EXTENDED, {
    fetchPolicy: 'cache-and-network',
  })
}