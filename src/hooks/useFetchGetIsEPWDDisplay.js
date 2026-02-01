import { gql, useQuery, useLazyQuery } from '@apollo/client'

export const GET_IS_EPWD_DISPLAY = gql`
  query GET_IS_EPWD_DISPLAY {
    getIsEPWDDisplay
  }
`

export default function useFetchGetIsEPWDDisplay() {
  return useQuery(GET_IS_EPWD_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
export function useFetchGetIsEPWDDisplayLazy() {
  const [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData] = useLazyQuery(GET_IS_EPWD_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
  return [getIsEPWDDisplayLazy, getIsEPWDDisplayLazyData]
}
