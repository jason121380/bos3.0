import { gql, useQuery } from '@apollo/client'

export const GET_CUS_RATING_DAY_LIMIT = gql`
  query GET_CUS_RATING_DAY_LIMIT {
    getCusRatingDayLimit
  }
`

export default function useFetchGetCusRatingDayLimit() {
  return useQuery(GET_CUS_RATING_DAY_LIMIT, {
    fetchPolicy: 'cache-and-network',
  })
}
