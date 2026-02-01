import { gql, useMutation } from '@apollo/client'

const SET_CREATE_MERCHANT_VENDOR = gql`
  mutation SET_CREATE_MERCHANT_VENDOR($input: CreateVendorInput!) {
    createMerchantVendor(input: $input)
  }
`

export default function useFetchSetCreateMerchantVendor() {
  const [createMerchantVendor] = useMutation(SET_CREATE_MERCHANT_VENDOR)
  return {
    createMerchantVendor: ({ input }) =>
      createMerchantVendor({
        variables: {
          input,
        },
      }),
  }
}
