import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY = settingsQuery(gql`
query GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY {
  getIsEmployeeScheduleWorkingHourDisplay 
}
`)

export default function useFetchGetIsEmployeeScheduleWorkingHourDisplay() {
  return useQuery(GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}