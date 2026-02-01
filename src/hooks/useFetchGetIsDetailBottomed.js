import { gql, useQuery } from '@apollo/client'

const GET_IS_DETAIL_BOTTOMED = gql`
  query GET_IS_DETAIL_BOTTOMED {
    getIsDetailBottomed
  }
`

export default function useFetchIsDetailBottomed() {
  return useQuery(GET_IS_DETAIL_BOTTOMED, {
    fetchPolicy: 'cache-and-network',
  })
}
