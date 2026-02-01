import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE = gql`
  query GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE($date: DateTime!) {
    merchantIncomeStatementV2ForOuterStore(date: $date) {
      subjectNumber
      subjectName
      cashRevenue
      cashExpenditure
      remark
    }
  }
`

export default function useFetchMerchantIncomeStatementV2OuterStore({ date }) {
  return useQuery(GET_MERCHANT_INCOME_STATEMENTV2_OUTER_STORE, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
