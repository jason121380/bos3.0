import { gql, useMutation } from '@apollo/client'

const ADD_CUSTOMIZE_MERCHANT_GROUP = gql`
  mutation AddCustomizeMerchantGroup($input: AddCustomizeMerchantGroupInput!) {
    addCustomizeMerchantGroup(input: $input) {
      id
      name
    }
  }
`

export default function useFetchAddCustomizeMerchantGroup() {
  const [addCustomizeMerchantGroup, customizeMerchantGroup] = useMutation(
    ADD_CUSTOMIZE_MERCHANT_GROUP
  )
  return {
    addCustomizeMerchantGroup: input =>
      addCustomizeMerchantGroup({
        variables: {
          input,
        },
      }),
    customizeMerchantGroup,
  }
}
