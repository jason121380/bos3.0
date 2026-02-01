import { useLazyQuery } from '@apollo/client'
import { gql } from 'apollo-boost'

const FETCH_PICKING_REPORT_EXCEL = gql`
  query pickingReportExcel($input: ReportInput!) {
    pickingReportExcel(input: $input)
  }
`

const useFetchPickingReportExcel = ({ input }) => {
  const [fetchPickingReportExcel, response] = useLazyQuery(FETCH_PICKING_REPORT_EXCEL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
  return { fetchPickingReportExcel, response }
}

export default useFetchPickingReportExcel
