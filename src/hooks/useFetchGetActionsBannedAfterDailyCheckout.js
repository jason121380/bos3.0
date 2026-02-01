import { gql, useQuery } from '@apollo/client'

const GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT = gql`
  query GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT {
    getActionsBannedAfterDailyCheckout
  }
`

export default function useFetchGetActionsBannedAfterDailyCheckout() {
  return useQuery(GET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT, {
    fetchPolicy: 'cache-and-network',
  })
}