import { gql, useQuery } from '@apollo/client'

const FETCH_MONEY_FLOW = gql`
  query FETCH_MONEY_FLOW($input: MoneyFlowsInput!) {
    moneyFlows(input: $input) {
      moneyFlows {
        id
        inoutType
        amount
        user {
          id
          name
        }
        walletType
        remark
        date
        accountingSubject {
          id
          name
        }
      }
    }
  }
`

export default function useFetchMoneyFlows(input) {
  return useQuery(FETCH_MONEY_FLOW, {
    variables: {
      input: {
        ...input,
        showAll: true,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
