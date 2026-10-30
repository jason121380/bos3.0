import { gql, useLazyQuery } from '@apollo/client'

export const GET_PRODUCT_INVOICING_RECORD_REPOPT = gql`
  query GET_PRODUCT_INVOICING_RECORD_REPOPT($input: DateTimeInput!, $productId: [ID]!, $recordType: [recordType]!) {
    productInvoicingRecordReport(input: $input, productId: $productId, recordType: $recordType) {
      date
      no
      productName
      productNo
      unit
      type
      count
    }
  }
`

export default function useFetchGetProductInvoicingRecordReport() {
  const [invoicingRecordReportLazy, invoicingRecordReportLazyData] = useLazyQuery(GET_PRODUCT_INVOICING_RECORD_REPOPT, {
    fetchPolicy: 'cache-and-network',
  })
  return [invoicingRecordReportLazy, invoicingRecordReportLazyData]
}
