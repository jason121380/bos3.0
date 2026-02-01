import { gql, useMutation } from '@apollo/client'

const SET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY = gql`
  mutation SET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY($input: Boolean!) {
    setIsEmployeeScheduleWorkingHourDisplay(input: $input)
  }
`

export default function useFetchSetIsEmployeeScheduleWorkingHourDisplay() {
  const [setWorkingHourDisplay] = useMutation(SET_IS_EMPLOYEE_SCHEDULE_WORKING_HOUR_DISPLAY)
  return {
    setWorkingHourDisplay: ({ input }) =>
      setWorkingHourDisplay({
        variables: {
          input,
        },
      }),
  }
}