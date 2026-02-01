import { gql, useQuery } from '@apollo/client'

export const GET_IS_QUICK_ORDER_MODE_ON = gql`
  query GET_IS_QUICK_ORDER_MODE_ON {
    getIsQuickOrderModeOn
  }
`

export default function useFetchGetIsQuickOrderModeOn() {
  return useQuery(GET_IS_QUICK_ORDER_MODE_ON, {
    fetchPolicy: 'cache-and-network',
  })
}
