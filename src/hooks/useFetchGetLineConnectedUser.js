import { gql, useQuery } from '@apollo/client'

const GET_LINE_CONNECTED_USER = gql`
  query GET_LINE_CONNECTED_USER {
    getLineConnectedUser {
      id
      name
    }
  }
`

export default function useFetchGetLineConnectedUser() {
  return useQuery(GET_LINE_CONNECTED_USER, {
    fetchPolicy: 'cache-and-network',
  })
}