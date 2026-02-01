import { gql, useLazyQuery } from '@apollo/client'

const FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL = gql`
  query FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL($input: DateTimeInput!) {
    getEmployeeClockInScheduleExcel(input: $input)
  }
`

export default function useFetchGetEmployeeClockInScheduleExcel() {
  const [getEmployeeClockInScheduleExcelLazy, getEmployeeClockInScheduleExcelData] = useLazyQuery(
    FETCH_GET_EMPLOYEE_CLOCK_IN_SCHEDULE_EXCEL,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
  return [getEmployeeClockInScheduleExcelLazy, getEmployeeClockInScheduleExcelData]
}
