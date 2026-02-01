import { gql, useQuery } from '@apollo/client'

const GET_DELETE_PERSONAL_COLCKIN_DISPLAY = gql`
  query GET_DELETE_PERSONAL_COLCKIN_DISPLAY {
    getDeletePersonalClockInDisplay
  }
`

export default function useFetchDeletePersonalClockInDisplay() {
  return useQuery(GET_DELETE_PERSONAL_COLCKIN_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
