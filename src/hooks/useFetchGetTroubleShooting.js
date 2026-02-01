import { gql, useQuery } from '@apollo/client'

const GET_TROUBLE_SHOOTING = gql`
  query GET_TROUBLE_SHOOTING {
    getTroubleShooting
  }
`

export default function useFetchGetTroubleShooting() {
  return useQuery(GET_TROUBLE_SHOOTING, {
    fetchPolicy: 'cache-and-network',
  })
}
