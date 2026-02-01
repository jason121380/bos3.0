import { gql, useMutation } from '@apollo/client'

const SET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE = gql`
  mutation SET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE($input: Boolean!) {
    setIsEmployeeScheduleUndoActive(input: $input)
  }
`

export default function useFetchSetIsEmployeeScheduleUndoActive() {
  const [setUndoActive] = useMutation(SET_IS_EMPLOYEE_SCHEDULE_UNDO_ACTIVE)
  return {
    setUndoActive: ({ input }) =>
      setUndoActive({
        variables: {
          input,
        },
      }),
  }
}
