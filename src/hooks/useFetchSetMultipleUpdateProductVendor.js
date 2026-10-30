import { gql, useMutation } from '@apollo/client'

const SET_MULTIPLE_UPDATE_PRODUCT_VENDOR = gql`
  mutation MultipleUpdateProductVendor($input: MultipleUpdateProductVendorInput!) {
    multipleUpdateProductVendor(input: $input)
  }
`

export default function useFetchSetMultipleUpdateProductVendor() {
  const [setVendor] = useMutation(SET_MULTIPLE_UPDATE_PRODUCT_VENDOR)
  return {
    setVendor: ({ input }) =>
      setVendor({
        variables: {
          input,
        },
      }),
  }
}
