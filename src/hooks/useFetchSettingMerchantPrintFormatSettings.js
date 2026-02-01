import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_ORDER_DETAIL_PRINT_LAYOUT = gql`
  mutation SET_MERCHANT_ORDER_DETAIL_PRINT_LAYOUT($input: String!) {
    setMerchantPrintFormatSettings(input: $input)
  }
`

export default function useFetchSettingMerchantOrderDetailPrintLayout() {
  const [setMerchantOrderPrint] = useMutation(SET_MERCHANT_ORDER_DETAIL_PRINT_LAYOUT)
  return {
    setMerchantOrderPrint: ({ input }) =>
      setMerchantOrderPrint({
        variables: {
          input,
        },
      }),
  }
}
