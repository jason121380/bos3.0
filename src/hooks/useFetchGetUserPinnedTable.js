import { gql, useQuery } from '@apollo/client'

const GET_USERS_PINNED_TABLE = gql`
  query GET_USERS_PINNED_TABLE {
    getUserPinnedTable
  }
`

export default function useFetchGetUserPinnedTable() {
  return useQuery(GET_USERS_PINNED_TABLE, {
    fetchPolicy: 'cache-and-network',
  })
}
