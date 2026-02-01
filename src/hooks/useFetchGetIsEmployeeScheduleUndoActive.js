import { gql, useQuery } from '@apollo/client'

const GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE = gql`
query GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE {
  getIsEmployeeScheduleUndoActive 
}
`

export default function useFetchGetIsEmployeeScheduleUndoActive() {
  return useQuery(GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE, {
    fetchPolicy: 'cache-and-network',
  })
}