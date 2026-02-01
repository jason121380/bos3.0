import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_INCOME_STATEMENTV2 = gql`
  query GET_MERCHANT_INCOME_STATEMENTV2($date: DateTime!) {
    merchantIncomeStatementV2(date: $date) {
      businessIncomeDetail {
        moneyFlowSetConnection {
          subjectName
          cashRevenue
          cashExpenditure
        }
      }
    }
  }
`

export default function useFetchMerchantIncomeStatementV2({ date }) {
  return useQuery(GET_MERCHANT_INCOME_STATEMENTV2, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
