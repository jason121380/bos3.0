import { gql, useQuery } from '@apollo/client'

const GET_EMPLOYEE_CLOCK_IN_SCHEDULE = gql`
  query GET_EMPLOYEE_CLOCK_IN_SCHEDULE($input: DateTimeInput!) {
    getEmployeeClockInSchedule(input: $input) {
      user {
        id
        name
      }
      clockInSchedule {
        date
        clockInSetting {
          id
          name
          color
        }
      }
    }
  }
`

export default function useFetchGetEmployeeClockInSchedule({ input }) {
  return useQuery(GET_EMPLOYEE_CLOCK_IN_SCHEDULE, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
