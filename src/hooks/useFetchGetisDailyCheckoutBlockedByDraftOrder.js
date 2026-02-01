import { gql, useQuery } from '@apollo/client'

export const GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER = gql`
  query GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER {
    getIsDailyCheckoutBlockedByDraftOrder
  }
`

export default function useFetchGetisDailyCheckoutBlockedByDraftOrder() {
  return useQuery(GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER, {
    fetchPolicy: 'cache-and-network',
  })
}