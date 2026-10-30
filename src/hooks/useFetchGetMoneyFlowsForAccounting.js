import { gql, useQuery } from '@apollo/client'

const GET_MONEY_FLOW_FOR_ACCOUNTING = gql`
  query GET_MONEY_FLOW_FOR_ACCOUNTING($input: MoneyFlowsInput!) {
    moneyFlows(input: $input) {
      moneyFlows {
        id
        date
        accountingSubject {
          id
          name
        }
        inoutType
        amount
        walletType
        remark
        user {
          id
          name
          designerNo
        }
        relationUser {
          name
        }
      }
      pageLimit
      pageOffset
      totalCount
      revenue
      expenditure
    }
  }
`

export default function useFetchGetMoneyFlowsForAccounting({ input }) {
  return useQuery(GET_MONEY_FLOW_FOR_ACCOUNTING, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
