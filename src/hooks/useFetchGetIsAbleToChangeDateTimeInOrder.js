import { gql, useQuery } from '@apollo/client'

export const GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER = gql`
  query GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER {
    getIsAbleToChangeDateTimeInOrderCreate
  }
`

export default function useFetchGetIsAbleToChangeDateTimeInOrder() {
  return useQuery(GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER, {
    fetchPolicy: 'cache-and-network',
  })
}
