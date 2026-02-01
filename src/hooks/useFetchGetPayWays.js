import { gql, useQuery } from '@apollo/client'

const GET_PAY_WAYS= gql`
  query GET_PAY_WAYS {
    payWays {
      value
      label
    }
  }
`

export default function useFetchGetPayWays() {
  return useQuery(GET_PAY_WAYS, {
    fetchPolicy: 'cache-and-network',
  })
}