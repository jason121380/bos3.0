import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT = settingsQuery(gql`
  query GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT {
    getIsMonthlyAverageDisplayForMerchantLeaderBoard
  }
`)

export default function useFetchGetIsMonthlyAverageDisplayForMerchantLeaderBoard() {
  return useQuery(GET_IS_MONTLY_AVERAGE_DISPLAY_FOR_MERCHANT_LEADER_REPORT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
