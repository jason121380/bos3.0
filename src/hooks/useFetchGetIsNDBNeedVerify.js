import { gql, useQuery } from '@apollo/client'

export const GET_IS_NDB_NEED_VERIFY = gql`
  query GET_IS_NDB_NEED_VERIFY {
    getIsNDBNeedVerify
  }
`

export default function useFetchGetIsNDBNeedVerify() {
  return useQuery(GET_IS_NDB_NEED_VERIFY, {
    fetchPolicy: 'cache-and-network',
  })
}
