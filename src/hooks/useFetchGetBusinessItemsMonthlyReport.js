import { gql, useQuery } from '@apollo/client'

const GET_BUSINESS_ITEMS_MOTHLY_REPORT = gql`
  query GET_BUSINESS_ITEMS_MOTHLY_REPORT($input: DateTimeInput!) {
    businessItemsMonthlyReport(input: $input) {
      businessItemsReportData {
        date
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
      businessItemsReportDataTotal {
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
      businessItemsReportDataDesignation {
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
      businessItemsReportDataNonDesignation {
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
      businessItemsReportDataDesignationProportion {
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
      businessItemsReportDataPerformanceProportion {
        cutomerCount
        productPerformance
        totalPerformance
        totalIncome
        serviceCategoriesPerformance {
          categoriesName
          performance
          count
        }
      }
    }
  }
`

export default function useFetchGetBusinessItemsMonthlyReport(input) {
  return useQuery(GET_BUSINESS_ITEMS_MOTHLY_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
