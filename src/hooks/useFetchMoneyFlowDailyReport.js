import { gql, useQuery } from '@apollo/client'

const GET_MONEY_FLOW__REPORT = gql`
  query GET_MONEY_FLOW__REPORT($input: DateTimeInput!) {
    moneyFlowDailyReport(input: $input) {
      itemName
      itemNo
      type
      moneyFlowRecord {
        date
        price
      }
    }
  }
`

export default function useFetchMoneyFlowDailyReport(input) {
  return useQuery(GET_MONEY_FLOW__REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
