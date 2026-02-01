import { gql, useMutation } from '@apollo/client'

const DELETE_CUSTOMIZE_MERCHANT_GROUP = gql`
  mutation DeleteCustomizeMerchantGroup($id: ID!) {
    deleteCustomizeMerchantGroup(id: $id)
  }
`

export default function useFetchDeleteCustomizeMerchantGroup() {
  const [deleteCustomizeMerchantGroup] = useMutation(DELETE_CUSTOMIZE_MERCHANT_GROUP)

  return {
    deleteCustomizeMerchantGroup: id =>
      deleteCustomizeMerchantGroup({
        variables: {
          id,
        },
      }),
  }
}
