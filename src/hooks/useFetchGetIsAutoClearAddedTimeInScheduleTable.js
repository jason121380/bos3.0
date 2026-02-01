import { gql, useQuery } from '@apollo/client'

const GET_IS_AUTO_CLEAR_ADDED_TIME_IN_SCHEDULE_TABLE = gql`
  query GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE {
    getIsAutoClearAddedTimeInScheduleTable
  }
`

export default function useFetchGetIsAutoClearAddedTimeInScheduleTable() {
  return useQuery(GET_IS_AUTO_CLEAR_ADDED_TIME_IN_SCHEDULE_TABLE, {
    fetchPolicy: 'cache-and-network',
  })
}