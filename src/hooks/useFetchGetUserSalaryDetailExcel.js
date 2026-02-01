import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_USER_SALARY_DETAIL_EXCEL = gql`
  query GET_USER_SALARY_DETAIL_EXCEL($date: DateTime) {
    getUserSalaryDetailExcel(date: $date)
  }
`

export default function useFetchGetUserSalaryDetailExcel(date) {
  return useQuery(GET_USER_SALARY_DETAIL_EXCEL, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetUserSalaryDetailExceLazy() {
  const [getUserSalaryDetailExceLazy, getUserSalaryDetailExceLazyData] = useLazyQuery(GET_USER_SALARY_DETAIL_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return { getUserSalaryDetailExceLazy, getUserSalaryDetailExceLazyData }
}