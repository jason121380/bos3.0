import { gql, useQuery } from '@apollo/client'

const GET_IS_ARROW_DISPLAY_PROFILE_SYNC = gql`
  query GET_IS_ARROW_DISPLAY_PROFILE_SYNC {
    getIsArrowDisplayForLine
  }
`

export default function useFetchGetIsArrowDisplayForLine() {
  return useQuery(GET_IS_ARROW_DISPLAY_PROFILE_SYNC, {
    fetchPolicy: 'cache-and-network',
  })
}