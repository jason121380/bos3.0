import { gql, useMutation } from '@apollo/client'

const SET_DELETE_MERCHANT_VENDOR = gql`
  mutation SET_DELETE_MERCHANT_VENDOR($merchantVendorUUIds: [ID]!) {
    deleteMerchantVendor(merchantVendorUUIds: $merchantVendorUUIds)
  }
`

export default function useFetchSetDeleteMerchantVendor() {
  const [deleteMerchantVendor] = useMutation(SET_DELETE_MERCHANT_VENDOR)
  return {
    deleteMerchantVendor: ({ merchantVendorUUIds }) =>
      deleteMerchantVendor({
        variables: {
          merchantVendorUUIds,
        },
      }),
  }
}
