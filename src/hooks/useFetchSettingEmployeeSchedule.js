import { gql, useMutation } from '@apollo/client'

const SET_EMPLOYEE_SCHEDULE = gql`
  mutation SET_EMPLOYEE_SCHEDULE($schedule: String, $currentScheduleId: ID) {
    setEmployeeSchedule(schedule: $schedule, currentScheduleId: $currentScheduleId) {
      id
      schedule
      isFirst
      isLast
    }
  }
`

export default function useFetchSettingEmployeeSchedule() {
  const [setEmployeeSchedule] = useMutation(SET_EMPLOYEE_SCHEDULE)
  return {
    setEmployeeSchedule: ({ schedule, currentScheduleId }) =>
      setEmployeeSchedule({
        variables: {
          schedule,
          currentScheduleId
        },
      }),
  }
}
