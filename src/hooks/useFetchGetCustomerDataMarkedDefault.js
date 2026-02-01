import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_DATA_MARKED = gql`
  query GET_CUSTOMER_DATA_MARKED {
    getCustomerDataMarkedDefault
  }
`

export default function useFetchCustomerDataMarked() {
  return useQuery(GET_CUSTOMER_DATA_MARKED, {
    fetchPolicy: 'cache-and-network',
  })
}
