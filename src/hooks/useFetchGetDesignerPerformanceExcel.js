import { gql, useLazyQuery } from '@apollo/client'

const GET_DESIGNER_PERFORMANCE_EXCEL = gql`
  query GET_DESIGNER_PERFORMANCE_EXCEL($input: DesignerPerformanceExcelInput!) {
    designerPerformanceExcel(input: $input) 
  }
`

export default function useFetchGetDesignerPerformanceExcel() {
  const [getDesignerPerformanceExcel, designerPerformanceExcelData] = useLazyQuery(GET_DESIGNER_PERFORMANCE_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [getDesignerPerformanceExcel, designerPerformanceExcelData]
}
