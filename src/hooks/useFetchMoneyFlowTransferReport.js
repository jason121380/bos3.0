import { gql, useQuery } from '@apollo/client'

const GET_MONEY_FLOW_TRANSFER_REPORT = gql`
  query GET_MONEY_FLOW_TRANSFER_REPORT($input: DateTimeInput!) {
    moneyFlowTransferReport(input: $input) {
      date
      businessCash
      cashRevenue
      cashExpenditure
      bankTransfer
      cashBalance
      totalCashBalance
    }
  }
`

export default function useFetchMoneyFlowTransferReport({ input }) {
  return useQuery(GET_MONEY_FLOW_TRANSFER_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
