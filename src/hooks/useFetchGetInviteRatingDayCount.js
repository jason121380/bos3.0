import { gql, useQuery } from '@apollo/client'

export const GET_INVITE_RATING_DAY_COUNT = gql`
  query GET_INVITE_RATING_DAY_COUNT {
    getInviteRatingDayCount
  }
`

export default function useFetchGetInviteRatingDayCount() {
  return useQuery(GET_INVITE_RATING_DAY_COUNT, {
    fetchPolicy: 'cache-and-network',
  })
}
