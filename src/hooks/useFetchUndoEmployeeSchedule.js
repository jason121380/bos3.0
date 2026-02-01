import { gql, useMutation } from '@apollo/client'

const UNDO_EMPLOYEE_SCHEDULE = gql`
  mutation UNDO_EMPLOYEE_SCHEDULE($currentScheduleId: ID) {
    undoEmployeeSchedule(currentScheduleId: $currentScheduleId) {
      id
      schedule
      isFirst
      isLast
    }
  }
`

export default function useFetchUndoEmployeeSchedule() {
  const [undoEmployeeSchedule] = useMutation(UNDO_EMPLOYEE_SCHEDULE)
  return {
    undoEmployeeSchedule: ({ currentScheduleId }) =>
      undoEmployeeSchedule({
        variables: {
          currentScheduleId,
        },
      }),
  }
}
