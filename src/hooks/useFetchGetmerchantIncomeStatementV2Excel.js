import { gql, useLazyQuery } from '@apollo/client'

export const GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL = gql`
  query GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL($date: DateTime!) {
    merchantIncomeStatementV2Excel (date : $date)
  }
`

export default function useFetchGetmerchantIncomeStatementV2Excel() {
  const [getmerchantIncomeStatementV2ExcelLazy, getmerchantIncomeStatementV2ExcelLazyData] = useLazyQuery(GET_MERCHANT_INCOMES_STATEMENT_V2_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getmerchantIncomeStatementV2ExcelLazy, getmerchantIncomeStatementV2ExcelLazyData]
}