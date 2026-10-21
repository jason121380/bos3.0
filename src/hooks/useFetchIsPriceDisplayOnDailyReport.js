import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT = settingsQuery(gql`
  query GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT {
    getPriceDisplayOnDailyReportDefault {
      isPriceDisplayOnDailyReport
      isServiceTicketMerged
      isHelperPointPriceDisplay
    }
  }
`)

export default function useFetchIsPriceDisplayOnDailyReportSetting() {
  return useQuery(GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
export function useFetchIsPriceDisplayOnDailyReportSettingLazy() {
  const [
    fetchIsPriceDisplayOnDailyReportSettingLazy,
    isPriceDisplayOnDailyReportSettingLazyData,
  ] = useLazyQuery(GET_PRICE_DISPLAY_ON_DAILY_REPORT_DEFAULT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { fetchIsPriceDisplayOnDailyReportSettingLazy, isPriceDisplayOnDailyReportSettingLazyData }
}
