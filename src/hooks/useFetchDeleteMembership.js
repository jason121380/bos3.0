import { gql, useMutation } from '@apollo/client'
// 刪除會員卡
const DELETE_MEMBERSHIP = gql`
  mutation deleteMembership($itemUUIDs: [ID]!) {
    deleteMembership(itemUUIDs: $itemUUIDs)
  }
`
export default function useFetchDeleteMembership() {
  const [deleteMembership] = useMutation(DELETE_MEMBERSHIP)
  return {
    deleteMembership: itemUUIDs =>
      deleteMembership({
        variables: {
          itemUUIDs,
        },
      }),
  }
}
