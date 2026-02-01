import { gql, useQuery, useLazyQuery } from '@apollo/client'

export const GET_IS_MEMBERSHIP_CARD_ACTIVE = gql`
  query GET_IS_MEMBERSHIP_CARD_ACTIVE {
    getIsMemberShipCardActive
  }
`

export default function useFetchGetIsMemberShipCardActive() {
  return useQuery(GET_IS_MEMBERSHIP_CARD_ACTIVE, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetIsMemberShipCardActiveLazy() {
  const [memberActiveLazy, memberActiveLazyData] = useLazyQuery(GET_IS_MEMBERSHIP_CARD_ACTIVE, {
    fetchPolicy: 'cache-and-network',
  })
  return { memberActiveLazy, memberActiveLazyData }
}