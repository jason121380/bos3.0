import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MERCHANT_SALARY_INCREASE_ITEMS = settingsQuery(gql`
  query GET_MERCHANT_SALARY_INCREASE_ITEMS {
    getMerchantSalaryIncreaseItems {
      id
      itemSetting
      type
      sorting
    }
  }
`)

export default function useFetchMerchantSalaryIncreaseItems() {
  return useQuery(GET_MERCHANT_SALARY_INCREASE_ITEMS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchMerchantSalaryIncreaseItemsLazy() {
  const [fetchMerchantSalaryIncreaseItemsLazy, merchantSalaryIncreaseItemsLazyData] = useLazyQuery(GET_MERCHANT_SALARY_INCREASE_ITEMS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return { fetchMerchantSalaryIncreaseItemsLazy, merchantSalaryIncreaseItemsLazyData }
}
