import { gql, useMutation } from '@apollo/client'

const REDO_EMPLOYEE_SCHEDULE = gql`
  mutation REDO_EMPLOYEE_SCHEDULE($currentScheduleId: ID) {
    redoEmployeeSchedule(currentScheduleId: $currentScheduleId) {
      id
      schedule
      isFirst
      isLast
    }
  }
`

export default function useFetchRedoEmployeeSchedule() {
  const [redoEmployeeSchedule] = useMutation(REDO_EMPLOYEE_SCHEDULE)
  return {
    redoEmployeeSchedule: ({ currentScheduleId }) =>
      redoEmployeeSchedule({
        variables: {
          currentScheduleId,
        },
      }),
  }
}
