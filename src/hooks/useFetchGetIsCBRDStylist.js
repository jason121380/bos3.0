import { gql, useQuery } from '@apollo/client'

const GET_IS_CBRD_STYLIST= gql`
  query GET_IS_CBRD_STYLIST {
    getIsCBRDStylist
  }
`

export default function useFetchGetIsCBRDStylist() {
  return useQuery(GET_IS_CBRD_STYLIST, {
    fetchPolicy: 'cache-and-network',
  })
}
