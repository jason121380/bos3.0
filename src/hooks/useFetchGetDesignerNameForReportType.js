import { gql, useQuery } from '@apollo/client'

const GET_DESIGNER_NAME_FOR_REPORT_TYPE = gql`
  query GET_DESIGNER_NAME_FOR_REPORT_TYPE {
    getDesignerNameForReportType
  }
`

export default function useFetchGetDesignerNameForReportType() {
  return useQuery(GET_DESIGNER_NAME_FOR_REPORT_TYPE, {
    fetchPolicy: 'cache-and-network',
  })
}