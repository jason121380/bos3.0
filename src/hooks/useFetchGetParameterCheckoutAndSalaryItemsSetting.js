import { gql, useQuery } from '@apollo/client'

const GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING = gql`
  query GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING {
    getParameterCheckoutAndSalaryItemsSetting {
      isSalaryItemAutoSetWhileMonthlyCheckout
      isHelperRetrieveAutoSetForMonthlyCheckout
      isDisplayFakePerformanceInSalaryReport
      isBorrowDisplayInSalaryOverview
      isPrintDetailDisplayOnSalaryReport
      isEPWDDisplay
      isPayslipOptimizationPrintModeOn
      employeePayslipPrintStyle
      isAttendanceStatisticsDisplayOnUserSalary
      isPrintDateHiddenForPayslip
    }
  }
`

export default function useFetchGetParameterCheckoutAndSalaryItemsSetting() {
  return useQuery(GET_PARAMETER_CHECKOUT_AND_SALARY_ITEM_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_PAYSLIP_OPTIMIZATION = gql`
  query GET_PAYSLIP_OPTIMIZATION {
    getParameterCheckoutAndSalaryItemsSetting {
      isPayslipOptimizationPrintModeOn
    }
  }
`

export function useFetchGetPayslipOptimization() {
  return useQuery(GET_PAYSLIP_OPTIMIZATION, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_ATTENDANCE_STATISTICS = gql`
  query GET_ATTENDANCE_STATISTICS {
    getParameterCheckoutAndSalaryItemsSetting {
      isAttendanceStatisticsDisplayOnUserSalary
    }
  }
`

export function useFetchGetAttendanceStatistics() {
  return useQuery(GET_ATTENDANCE_STATISTICS, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_IS_PRINT_DATE_HIDDEN = gql`
  query GET_IS_PRINT_DATE_HIDDEN {
    getParameterCheckoutAndSalaryItemsSetting {
      isPrintDateHiddenForPayslip
    }
  }
`

export function useFetchGetIsPrintDateHiddenForPayslip() {
  return useQuery(GET_IS_PRINT_DATE_HIDDEN, {
    fetchPolicy: 'cache-and-network',
  })
}
