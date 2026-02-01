import { gql, useQuery } from '@apollo/client'

export const GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT = gql`
  query GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT {
    getIsOpenDateRangeInOrderMangement
  }
`

export default function useFetchGetIsOpenDateRangeInOrderMangement() {
  return useQuery(GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT, {
    fetchPolicy: 'cache-and-network',
  })
}
