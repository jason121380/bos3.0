import { gql, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL = gql`
  query FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL($input: DateTimeInput!, $designerIds: [ID], $displayReference: DisplayReferenceEnum) {
    designerPerforamnceAnalyzeExcel(input: $input, designerIds: $designerIds, displayReference: $displayReference)
  }
`

export function useFetchDesignerPerformanceAnalyzeExcelLazy() {
  const [designerPerformanceAnalyzeExcelLazy, designerPerformanceAnalyzeExcelLazyData] = useLazyQuery(FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [designerPerformanceAnalyzeExcelLazy, designerPerformanceAnalyzeExcelLazyData]
}
