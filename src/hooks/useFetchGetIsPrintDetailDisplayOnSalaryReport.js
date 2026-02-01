import { gql, useQuery } from '@apollo/client'

const GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT = gql`
  query GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT {
    getIsPrintDetailDisplayOnSalaryReport 
  }
`

export default function useFetchGetIsPrintDetailDisplayOnSalaryReport() {
  return useQuery(GET_PRINT_DETAIL_DISPLAY_ON_SALARY_REPORT, {
    fetchPolicy: 'cache-and-network',
  })
}