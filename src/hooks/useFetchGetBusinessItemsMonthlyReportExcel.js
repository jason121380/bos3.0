import { gql, useLazyQuery } from '@apollo/client'

export const GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL = gql`
  query GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL($input: DateTimeInput!) {
    businessItemsMonthlyReportExcel(input: $input)
  }
`

export default function useFetchGetBusinessItemsMonthlyReportExcel() {
  const [getBusinessItemsMonthlyReport, businessItemsMonthlyReportData] = useLazyQuery(GET_BUSINESS_ITEM_MONTHLY_REPORT_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getBusinessItemsMonthlyReport, businessItemsMonthlyReportData]
}
