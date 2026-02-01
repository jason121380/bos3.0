import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_CUSTOMER_BONUS = gql`
  query GET_CUSTOMER_BONUS {
    getIsCustomerBonusActive
  }
`

export default function useFetchGetIsCustomerBonusActive() {
  return useQuery(GET_CUSTOMER_BONUS, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetIsCustomerBonusActiveLazy() {
  const [customerBonusActiveLazy, customerBonusActiveData] = useLazyQuery(GET_CUSTOMER_BONUS, {
    fetchPolicy: 'cache-and-network',
  })
  return [customerBonusActiveLazy, customerBonusActiveData]
}