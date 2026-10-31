import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_SALARY_DECREASE_ITEMS = settingsQuery(gql`
  query GET_MERCHANT_SALARY_DECREASE_ITEMS {
    getMerchantSalaryDecreaseItems {
      id
      itemSetting
      type
      sorting
    }
  }
`)

export default function useFetchMerchantSalaryDecreaseItems() {
  return useQuery(GET_MERCHANT_SALARY_DECREASE_ITEMS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchMerchantSalaryDecreaseItemsLazy() {
  const [fetchMerchantSalaryDecreaseItemsLazy, merchantSalaryDecreaseItemsLazyData] = useLazyQuery(GET_MERCHANT_SALARY_DECREASE_ITEMS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { fetchMerchantSalaryDecreaseItemsLazy, merchantSalaryDecreaseItemsLazyData }
}
