import { gql, useMutation } from '@apollo/client'

const SET_UPDATE_MERCHANT_VENDOR = gql`
  mutation SET_UPDATE_MERCHANT_VENDOR($input: UpdateVendorInput!) {
    updateMerchantVendor(input: $input)
  }
`

export default function useFetchSetUpdateMerchantVendor() {
  const [updateMerchantVendor] = useMutation(SET_UPDATE_MERCHANT_VENDOR)
  return {
    updateMerchantVendor: ({ input }) =>
      updateMerchantVendor({
        variables: {
          input,
        },
      }),
  }
}
