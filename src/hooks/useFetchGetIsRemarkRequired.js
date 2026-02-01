import { gql, useQuery } from '@apollo/client'

export const GET_IS_REMARK_REQUIRED = gql`
  query GET_IS_REMARK_REQUIRED {
    getIsRemarkRequired
  }
`

export default function useFetchGetIsRemarkRequired() {
  return useQuery(GET_IS_REMARK_REQUIRED, {
    fetchPolicy: 'cache-and-network',
  })
}