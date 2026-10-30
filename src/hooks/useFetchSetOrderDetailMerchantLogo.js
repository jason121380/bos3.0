import { gql, useMutation } from '@apollo/client'

const SET_ORDER_DETAIL_MERCHANT_LOGO = gql`
  mutation SET_ORDER_DETAIL_MERCHANT_LOGO($file: Upload!) {
    setOrderDetailMerchantLogo(file: $file)
  }
`

export default function useFetchSetOrderDetailMerchantLogo() {
  const [uploadMerchantLogo] = useMutation(SET_ORDER_DETAIL_MERCHANT_LOGO)
  return {
    uploadMerchantLogo: ({ file }) =>
      uploadMerchantLogo({
        variables: {
          file,
        },
      }),
  }
}
