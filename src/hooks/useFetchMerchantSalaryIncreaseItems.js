import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_MERCHANT_SALARY_INCREASE_ITEMS = gql`
  query GET_MERCHANT_SALARY_INCREASE_ITEMS {
    getMerchantSalaryIncreaseItems {
      id
      itemSetting
      type
      sorting
    }
  }
`

export default function useFetchMerchantSalaryIncreaseItems() {
  return useQuery(GET_MERCHANT_SALARY_INCREASE_ITEMS, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchMerchantSalaryIncreaseItemsLazy() {
  const [fetchMerchantSalaryIncreaseItemsLazy, merchantSalaryIncreaseItemsLazyData] = useLazyQuery(
    GET_MERCHANT_SALARY_INCREASE_ITEMS,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return { fetchMerchantSalaryIncreaseItemsLazy, merchantSalaryIncreaseItemsLazyData }
}
