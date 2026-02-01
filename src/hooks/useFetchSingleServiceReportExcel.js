import { gql, useLazyQuery } from '@apollo/client'

const GET_SINGLE_SERVICE_EXCEL = gql`
  query GET_SINGLE_SERVICE_EXCEL($input: SingleServiceItemInput!) {
    singleServiceItemExcel(input: $input) 
  }
`

export default function useFetchSingleServiceReportExcel() {
  const [singleServiceReportExcel, singleServiceReportExcelData] = useLazyQuery(GET_SINGLE_SERVICE_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [singleServiceReportExcel, singleServiceReportExcelData]
}