import { gql, useMutation } from '@apollo/client'
// 刪除會員卡
const DELETE_MEMBERSHIP_CATEGORY = gql`
  mutation deleteMembershipCategory($itemUUIDs: [ID]!) {
    deleteMembershipCategory(itemUUIDs: $itemUUIDs)
  }
`
export default function useFetchDeleteMembershipCategory() {
  const [deleteMembershipCategory] = useMutation(DELETE_MEMBERSHIP_CATEGORY)
  return {
    deleteMembershipCategory: itemUUIDs =>
      deleteMembershipCategory({
        variables: {
          itemUUIDs,
        },
      }),
  }
}
