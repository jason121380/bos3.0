import { gql, useQuery } from '@apollo/client'

const GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON = gql`
  query GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON {
    getIsDisplayTogglePerformanceButton
  }
`

export default function useFetchGetIsDisplayTogglePerformanceButton() {
  return useQuery(GET_IS_DISPLAY_TOGGLE_PERORMANCE_BUTTON, {
    fetchPolicy: 'cache-and-network',
  })
}