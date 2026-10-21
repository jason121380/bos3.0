import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_MERCHANT_ORDER_PRINT_LAYOUT = settingsQuery(gql`
  query GET_MERCHANT_ORDER_PRINT_LAYOUT {
    getMerchantPrintFormatSettings
  }
`)

export default function useFetchMerchantOrderDetailPrintLayout() {
  return useQuery(GET_MERCHANT_ORDER_PRINT_LAYOUT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
