import { gql, useQuery } from '@apollo/client'

export const GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT = gql`
  query GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT {
    getIsDisplayHelperRetrieveInDailyReport
  }
`

export default function useFetchGetIsDisplayHelperRetrieveInDailyReport() {
  return useQuery(GET_IS_DISPLAY_HELPER_RETRIEVE_DAILY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}
