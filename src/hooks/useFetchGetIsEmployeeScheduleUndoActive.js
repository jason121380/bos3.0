import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE = settingsQuery(gql`
query GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE {
  getIsEmployeeScheduleUndoActive 
}
`)

export default function useFetchGetIsEmployeeScheduleUndoActive() {
  return useQuery(GET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
