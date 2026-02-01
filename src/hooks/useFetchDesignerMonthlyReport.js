import { gql, useQuery } from '@apollo/client'

const GET_DESIGNER_MONTHLY_REPORT = gql`
  query GET_DESIGNER_MONTHLY_REPORT($input: DesignerMonthlyReportInput!) {
    designerMonthlyReport(input: $input) {
      date
      designerName
      fakePerformance
      truthPerformance
      orderTotalCount
      orderDesignateCount
      orderNonDesignateCount
      orderAverageFakePerformance
      orderAverageTruthPerformance
      productFakePerformance
      membershipFakePerformance
      monthIndex
    }
  }
`

export default function useFetchDesignerMonthlyReport(input) {
  return useQuery(GET_DESIGNER_MONTHLY_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
