import { gql, useMutation } from '@apollo/client'

const DEL_COUPONS = gql`
  mutation DEL_COUPONS($itemIds: [ID!], $password: String) {
    deleteService(itemIds: $itemIds, password: $password)
  }
`

export default function useFetchDeleteService() {
  const [deleteService] = useMutation(DEL_COUPONS)
  return {
    deleteService: ({ itemIds, password }) =>
      deleteService({
        variables: {
          itemIds,
          password,
        },
      }),
  }
}
