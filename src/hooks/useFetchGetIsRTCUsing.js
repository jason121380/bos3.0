import { gql, useQuery } from '@apollo/client'

export const GET_IS_RTC_USING= gql`
  query GET_IS_RTC_USING {
    getIsRTCUsing
  }
`

export default function useFetchGetIsRTCUsing() {
  return useQuery(GET_IS_RTC_USING, {
    fetchPolicy: 'cache-and-network',
  })
}