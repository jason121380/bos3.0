import { gql, useQuery } from '@apollo/client'

const GET_IS_LOCK_DATE_DISPLAY = gql`
  query GET_IS_LOCK_DATE_DISPLAY {
    getIsDateLockDisplay
  }
`

export default function useFetchGetIsLockDateDisplaySetting() {
  return useQuery(GET_IS_LOCK_DATE_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
