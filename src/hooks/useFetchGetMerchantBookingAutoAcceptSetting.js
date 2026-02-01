import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_BOOK_AUTO_ACCEPT = gql`
  query GET_MERCHANT_BOOK_AUTO_ACCEPT {
    getMerchantBookingAutoAcceptSetting
  }
`

export default function useFetchMerchantBookingAutoAcceptSetting() {
  return useQuery(GET_MERCHANT_BOOK_AUTO_ACCEPT, {
    fetchPolicy: 'cache-and-network',
  })
}
