import { gql, useQuery } from '@apollo/client'
const GET_MERCHANT_REVERVATION_TIME = gql`
  query GET_MERCHANT_REVERVATION_TIME {
    getMerchantReservationTime {
      title
      useDay
      openingHours
      closingHours
    }
  }
`

export default function useFetchGetMerchantReservationTime() {
  return useQuery(GET_MERCHANT_REVERVATION_TIME, {
    fetchPolicy: 'cache-and-network',
  })
}