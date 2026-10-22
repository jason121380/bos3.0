import { gql, useLazyQuery } from '@apollo/client'

const GET_USER_SALARY_EXCEL = gql`
  query GET_USER_SALARY_EXCEL($date: DateTime, $designerId: ID) {
    userSalaryReportExcel(date: $date, designerId: $designerId)
  }
`

export function useFetchGetUserSalaryExcelLazy() {
  const [getUserSalaryExcelLazy, getUserSalaryExcelLazyData] = useLazyQuery(GET_USER_SALARY_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getUserSalaryExcelLazy, getUserSalaryExcelLazyData]
}