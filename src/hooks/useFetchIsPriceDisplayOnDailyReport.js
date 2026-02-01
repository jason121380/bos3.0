import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT = gql`
  query GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT {
    getPriceDisplayOnDailyReportDefault {
      isPriceDisplayOnDailyReport
      isServiceTicketMerged
      isHelperPointPriceDisplay
    }
  }
`

export default function useFetchIsPriceDisplayOnDailyReportSetting() {
  return useQuery(GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT, {
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchIsPriceDisplayOnDailyReportSettingLazy() {
  const [
    fetchIsPriceDisplayOnDailyReportSettingLazy,
    isPriceDisplayOnDailyReportSettingLazyData,
  ] = useLazyQuery(GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT, {
    fetchPolicy: 'cache-and-network',
  })
  return { fetchIsPriceDisplayOnDailyReportSettingLazy, isPriceDisplayOnDailyReportSettingLazyData }
}
