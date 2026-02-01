import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_MERCHANT_SALARY_DECREASE_ITEMS = gql`
  query GET_MERCHANT_SALARY_DECREASE_ITEMS {
    getMerchantSalaryDecreaseItems {
      id
      itemSetting
      type
      sorting
    }
  }
`

export default function useFetchMerchantSalaryDncreaseItems() {
  return useQuery(GET_MERCHANT_SALARY_DECREASE_ITEMS, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchMerchantSalaryDecreaseItemsLazy() {
  const [fetchMerchantSalaryDecreaseItemsLazy, merchantSalaryDecreaseItemsLazyData] = useLazyQuery(
    GET_MERCHANT_SALARY_DECREASE_ITEMS,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return { fetchMerchantSalaryDecreaseItemsLazy, merchantSalaryDecreaseItemsLazyData }
}
