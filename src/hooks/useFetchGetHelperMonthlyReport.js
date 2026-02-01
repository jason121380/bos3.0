import { gql, useQuery } from '@apollo/client'

const GET_HELPER_MONTHLY_REPORT = gql`
  query GET_HELPER_MONTHLY_REPORT($input: DateTimeInput!) {
    helperMonthlyReport(input: $input) {
      designer
      helperRetrievePriceWithoutPoint
      helperRetrievePoint
      productPerformance
      productRake
      membershipPerformance
      membershipRake
    }
  }
`

export const useFetchGetHelperMonthlyReport = input =>
  useQuery(GET_HELPER_MONTHLY_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
