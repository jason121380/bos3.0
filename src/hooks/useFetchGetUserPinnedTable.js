import { gql, useQuery } from '@apollo/client'

const GET_USERS_PINNED_TABLE = gql`
  query GET_USERS_PINNED_TABLE {
    getUserPinnedTable
  }
`

// skip：版面以 useAfterFirstLoad 延後到首屏完成後再查（lib/after-first-load）
export default function useFetchGetUserPinnedTable({ skip = false } = {}) {
  return useQuery(GET_USERS_PINNED_TABLE, {
    fetchPolicy: 'cache-and-network',
    skip,
  })
}
