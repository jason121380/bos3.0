import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_LOCKED_CATEGORY = gql`
  mutation SET_MERCHANT_LOCKED_CATEGORY($input: SetMerchantLockedCategoryDefaultInput!) {
    setMerchantLockedCategoryDefault(input: $input) {
      status
      result {
        service
        product
        ticket
      }
    }
  }
`

export default function useFetchSettingMerchantLockedCategoryDefault() {
  const [setMerchantLockedCategory] = useMutation(SET_MERCHANT_LOCKED_CATEGORY)
  return {
    setMerchantLockedCategory: ({ input }) =>
      setMerchantLockedCategory({
        variables: {
          input,
        },
      }),
  }
}
