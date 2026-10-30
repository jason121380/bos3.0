import { gql, useQuery } from '@apollo/client'

const GET_CUSTOMER_SELF_CREATE_ACTIVE = gql`
  query GET_CUSTOMER_SELF_CREATE_ACTIVE($input: ID!) {
    getIsCustomerSelfCreateActive(input: $input)
  }
`

export default function useFetchGetIsCustomerSelfCreateActive({ input }) {
  return useQuery(GET_CUSTOMER_SELF_CREATE_ACTIVE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
