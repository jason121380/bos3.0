import { gql, useLazyQuery } from '@apollo/client'

const GET_SINGLE_SERVICE_EXCEL_V2 = gql`
  query GET_SINGLE_SERVICE_EXCEL_V2($input: SingleServiceItemV2Input!, $sortBy: SingleServiceSortWayEnum) {
    singleServiceItemExcelV2(input: $input, sortBy: $sortBy) 
  }
`

export default function useFetchSingleServiceReportExcelV2() {
  const [singleServiceReportExcel, singleServiceReportExcelData] = useLazyQuery(GET_SINGLE_SERVICE_EXCEL_V2, {
    fetchPolicy: 'cache-and-network',
  })
  return [singleServiceReportExcel, singleServiceReportExcelData]
}
