import { gql, useMutation } from '@apollo/client'

const SET_EMPLOYEE_CLOCK_IN_SCHDULE = gql`
  mutation SET_EMPLOYEE_CLOCK_IN_SCHDULE($input: [SetEmployeeClockInScheduleInput]!) {
    setEmployeeClockInSchedule(input: $input)
  }
`

export default function useFetchSetEmployeeClockInSchedule() {
  const [setEmployeeClockInSchedule] = useMutation(SET_EMPLOYEE_CLOCK_IN_SCHDULE)
  return {
    setEmployeeClockInSchedule: ({ input }) =>
      setEmployeeClockInSchedule({
        variables: {
          input,
        },
      }),
  }
}
