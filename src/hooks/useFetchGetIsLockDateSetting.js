import { gql, useQuery } from '@apollo/client'

const GET_IS_LOCK_DATE = gql`
  query GET_IS_LOCK_DATE {
    getIsDateLock
  }
`

export default function useFetchGetIsLockDateSetting() {
  return useQuery(GET_IS_LOCK_DATE, {
    fetchPolicy: 'cache-and-network',
  })
}
