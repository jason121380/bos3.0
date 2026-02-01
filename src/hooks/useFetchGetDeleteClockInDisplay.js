import { gql, useQuery } from '@apollo/client'

const GET_DELETE_ALL_COLCKIN_DISPLAY = gql`
  query GET_DELETE_ALL_COLCKIN_DISPLAY {
    getDeleteClockInDisplay
  }
`

export default function useFetchDeleteClockInDisplay() {
  return useQuery(GET_DELETE_ALL_COLCKIN_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
