import { gql, useQuery } from '@apollo/client'

const GET_LAST_CUSTOMER_NO = gql`
  query GET_LAST_CUSTOMER_NO {
    getLastCustomerNo
  }
`

export default function useFetchGetLastCustomerNo() {
  return useQuery(GET_LAST_CUSTOMER_NO, {
    fetchPolicy: 'cache-and-network',
  })
}