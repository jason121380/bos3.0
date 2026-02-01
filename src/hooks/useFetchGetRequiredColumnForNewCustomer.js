import { gql, useQuery } from '@apollo/client'

export const GET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER = gql`
  query GET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER {
    getRequiredColumnForNewCustomer
  }
`

export default function useFetchGetRequiredColumnForNewCustomer() {
  return useQuery(GET_REQUIRED_COLUMN_FOR_NEW_CUSTOMER, {
    fetchPolicy: 'cache-and-network',
  })
}
