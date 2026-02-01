import { gql, useQuery } from '@apollo/client'

const GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY = gql`
query GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY {
  getIsEmployeeScheduleWorkingHourDisplay 
}
`

export default function useFetchGetIsEmployeeScheduleWorkingHourDisplay() {
  return useQuery(GET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}