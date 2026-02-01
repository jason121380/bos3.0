import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL = gql`
  query FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL($input: DateTimeInput!, $designerIds: [ID], $displayReference: DisplayReferenceEnum) {
    designerPerforamnceAnalyzeExcel(input: $input, designerIds: $designerIds, displayReference: $displayReference)
  }
`
export default function useFetchDesignerPerforamnceAnalyzeExcel({ input, designerIds, displayReference }) {
  return useQuery(FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL, {
    variables: {
      input,
      designerIds,
      displayReference
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchDesignerPerforamnceAnalyzeExcelLazy() {
  const [designerPerforamnceAnalyzeExcelLazy, designerPerforamnceAnalyzeExcelLazyData] = useLazyQuery(FETCH_DESIGNER_PERFORMANCE_ANALYZE_EXCEL, {
    fetchPolicy: 'cache-and-network',
  })
  return [designerPerforamnceAnalyzeExcelLazy, designerPerforamnceAnalyzeExcelLazyData]
}