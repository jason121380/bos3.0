import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT = gql`
  query GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT {
    getIsZeroValueHiddenOnDailyReport
  }
`

export default function useFetchGetIsZeroValueHiddenOnDailyReport() {
  return useQuery(GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchGetIsZeroValueHiddenOnDailyReportLazy() {
  const [
    fetchGetIsZeroValueHiddenOnDailyReportLazy,
    getIsZeroValueHiddenOnDailyReportLazyData,
  ] = useLazyQuery(GET_IS_ZERO_VALUE_HIDDEN_ON_DAILY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchGetIsZeroValueHiddenOnDailyReportLazy, getIsZeroValueHiddenOnDailyReportLazyData }
}
