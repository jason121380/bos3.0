import { gql, useQuery } from '@apollo/client'

const GET_EMPLOYEE_PAYSLIP_PRINT_STYLE = gql`
  query GET_EMPLOYEE_PAYSLIP_PRINT_STYLE {
    getEmployeePayslipPrintStyle 
  }
`

export default function useFetchGetEmployeePayslipPrintStyle() {
  return useQuery(GET_EMPLOYEE_PAYSLIP_PRINT_STYLE, {
    fetchPolicy: 'cache-and-network',
  })
}