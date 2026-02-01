import { gql, useQuery } from '@apollo/client'

const GET_PAYMENTS = gql`
  query PAYMENTS {
    merchantPayWays {
      id
      type
      name
      fee
      amountType
      isNoCash
    }
  }
`

export default function useFetchPayments() {
  const { data, error, loading, refetch } = useQuery(GET_PAYMENTS, {
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, refetch }
}
const GET_PAYMENTS_NAME = gql`
  query GET_PAYMENTS_NAME {
    merchantPayWays {
      id
      name
    }
  }
`

export function useFetchPaymentsName() {
  const { data, error, loading, refetch } = useQuery(GET_PAYMENTS_NAME, {
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, refetch }
}
