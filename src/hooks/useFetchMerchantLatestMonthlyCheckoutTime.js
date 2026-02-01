// Get月結時間API

import { gql, useQuery } from '@apollo/client'

export const GET_LATEST_MONTLY_CHECKOUT_TIME = gql`
  query GET_LATEST_MONTLY_CHECKOUT_TIME($date: DateTime!) {
    merchantLatestMonthlyCheckoutTime(date: $date)
  }
`

export default function useFetchMerchantLatestMonthlyCheckoutTime({ date }) {
  return useQuery(GET_LATEST_MONTLY_CHECKOUT_TIME, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
