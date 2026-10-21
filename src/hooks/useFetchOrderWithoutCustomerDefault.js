import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_ORDER_WITHOUT_CUSTOMER_SETTING = settingsQuery(gql`
  query GET_ORDER_WITHOUT_CUSTOMER_SETTING {
    orderWithoutCustomerDefault
  }
`)

export default function useFetchOrderWithoutCustomerSetting() {
  return useQuery(GET_ORDER_WITHOUT_CUSTOMER_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
