import { gql, useQuery } from '@apollo/client'

const GET_PINNED_TABLE_DEF_STRUCTURES = gql`
  query GET_PINNED_TABLE_DEF_STRUCTURES {
    getPinnedTableDefStructures
  }
`

export default function useFetchGetPinnedTableDefStructures() {
  return useQuery(GET_PINNED_TABLE_DEF_STRUCTURES, {
    fetchPolicy: 'cache-and-network',
  })
}
