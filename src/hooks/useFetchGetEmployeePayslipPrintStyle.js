import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_EMPLOYEE_PAYSLIP_PRINT_STYLE = settingsQuery(gql`
  query GET_EMPLOYEE_PAYSLIP_PRINT_STYLE {
    getEmployeePayslipPrintStyle 
  }
`)

export default function useFetchGetEmployeePayslipPrintStyle() {
  return useQuery(GET_EMPLOYEE_PAYSLIP_PRINT_STYLE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}