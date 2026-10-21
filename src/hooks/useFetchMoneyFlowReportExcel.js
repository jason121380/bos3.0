import { useLazyQuery } from '@apollo/client'
import { gql } from '@apollo/client'

const FETCH_MONEY_FLOW_REPORT_EXCEL = gql`
  query moneyFlowReportExcel($input: ReportInput!) {
    moneyFlowReportExcel(input: $input)
  }
`

const useFetchMoneyFlowReportExcel = ({ input }) => {
  const [fetchMoneyFlowReportExcel, response] = useLazyQuery(FETCH_MONEY_FLOW_REPORT_EXCEL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return { fetchMoneyFlowReportExcel, response }
}

export default useFetchMoneyFlowReportExcel
