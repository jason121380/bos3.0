import { gql, useQuery } from '@apollo/client'

const FETCH_DESIGNER_DAILY_REPORT_EXCEL = gql`
  query FETCH_DESIGNER_DAILY_REPORT_EXCEL($date: DateTime) {
    designerDailyReportExcel(date: $date)
  }
`
export default function useFetchDesignerReportExcel({ date }) {
  return useQuery(FETCH_DESIGNER_DAILY_REPORT_EXCEL, {
    variables: {
      date,
    },
    fetchPolicy: 'cache-and-network',
  })
}
