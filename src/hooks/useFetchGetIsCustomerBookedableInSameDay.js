import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_BOOKEDABLE_IN_SAME_DAY = gql`
  query getIsCustomerBookedableInSameDay {
    getIsCustomerBookedableInSameDay
  }
`

export default function useFetchGetIsCustomerBookedableInSameDay() {
  return useQuery(GET_CUSTOMER_BOOKEDABLE_IN_SAME_DAY, {
    fetchPolicy: 'cache-and-network',
  })
}