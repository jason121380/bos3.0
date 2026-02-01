import { gql, useQuery } from '@apollo/client'

const FETCH_MONEY_FLOW_CONNECT = gql`
  query FETCH_MONEY_FLOW_CONNECT($startDate: DateTime!, $endDate: DateTime!) {
    moneyFlowSetConnection(startDate: $startDate, endDate: $endDate) {
      inoutType
      amount
      accountingSubject {
        id
        name
      }
    }
  }
`

export default function useFetchMoneyFlowConnection({ startDate, endDate }) {
  return useQuery(FETCH_MONEY_FLOW_CONNECT, {
    variables: {
      startDate,
      endDate,
    },
    fetchPolicy: 'cache-and-network',
  })
}
