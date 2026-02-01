import { gql, useQuery } from '@apollo/client'

const GET_PAYMENT = gql`
  query PAYMENT($id: ID!) {
    merchantPayWay(id: $id) {
      id
      type
      name
      fee
      amountType
      isNoCash
    }
  }
`

export default function useFetchPayment({ id }) {
  const { data, loading, error, refetch } = useQuery(GET_PAYMENT, {
    variables: {
      id,
    },
    fetchPolicy: 'cache-and-network',
  })
  return { data, loading, error, refetch }
}
