import { gql, useMutation } from '@apollo/client'

const SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE = gql`
  mutation SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE($input: AddAttendantRecordInput!) {
    addAttendantRecord(input: $input)
  }
`

export default function useFetchSetAddEmployeeClockInSchedule() {
  const [addEmployeeClockInSchedule] = useMutation(SET_ADD_EMPLOYEE_CLOCK_IN_SCHEDULE)
  return {
    addEmployeeClockInSchedule: ({ input }) =>
    addEmployeeClockInSchedule({
        variables: {
          input,
        },
      }),
  }
}
