import { gql, useQuery } from '@apollo/client'

const GET_MONEY_FLOW_CATEGORY_REPORT = gql`
  query GET_MONEY_FLOW_CATEGORY_REPORT($input: DateTimeInput!) {
    moneyFlowCategoryReport(input: $input) {
      revenueSummary
      expenditureSummary
      moneyFlowCategoryReport {
        revenueSummary
        expenditureSummary
        moneyFlow {
          date
          subjectNo
          subjectName
          revenue
          expenditure
          remark
        }
      }
    }
  }
`

export default function useFetchMoneyFlowCategoryReport({ input }) {
  return useQuery(GET_MONEY_FLOW_CATEGORY_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
