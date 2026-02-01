import { gql, useQuery } from '@apollo/client'

const GET_THIRD_PARTY_COUPONS = gql`
  query GET_THIRD_PARTY_COUPONS {
    getThirdPartTicket {
      id
      name
      type
      handlingFee
      isNoCash
    }
  }
`

export default function useFetchThirdPartyCoupons() {
  const { data, error, loading, refetch } = useQuery(GET_THIRD_PARTY_COUPONS, {
    fetchPolicy: 'cache-and-network',
  })
  return { data, error, loading, refetch }
}
