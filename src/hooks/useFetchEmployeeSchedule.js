import { gql, useQuery } from '@apollo/client'

const FETCH_EMPLOYEE_SCHEDULE = gql`
  query FETCH_EMPLOYEE_SCHEDULE {
    getEmployeeSchedule {
      id
      schedule
      isFirst
      isLast
    }
  }
`

export default function useFetchEmployeeSchedule() {
  return useQuery(FETCH_EMPLOYEE_SCHEDULE, {
    fetchPolicy: 'cache-and-network',
  })
}
