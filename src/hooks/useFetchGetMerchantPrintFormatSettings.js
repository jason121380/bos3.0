import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_ORDER_PRINT_LAYOUT = gql`
  query GET_MERCHANT_ORDER_PRINT_LAYOUT {
    getMerchantPrintFormatSettings
  }
`

export default function useFetchMerchantOrderDetailPrintLayout() {
  return useQuery(GET_MERCHANT_ORDER_PRINT_LAYOUT, {
    fetchPolicy: 'cache-and-network',
  })
}
