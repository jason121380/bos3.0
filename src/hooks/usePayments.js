import { useQuery } from '@apollo/client'
import { gql } from 'apollo-boost'

const PAYMENTS = gql`
  query PAYMENTS {
    merchantPayWays {
      id
      name
    }
  }
`

export default function useFetchPayments() {
  return useQuery(PAYMENTS)
}
