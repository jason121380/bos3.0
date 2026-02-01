import { gql, useMutation } from '@apollo/client'
// 編輯會員卡類別
const UPDATE_MEMBERSHIP_CATEGORY = gql`
  mutation updateMembershipCategory($input: UpdateMembershipCategoryInput!) {
    updateMembershipCategory(input: $input)
  }
`
export default function useFetchUpdateMembershipCategory() {
  const [updateMembershipCategory] = useMutation(UPDATE_MEMBERSHIP_CATEGORY)
  return {
    updateMembershipCategory: input =>
      updateMembershipCategory({
        variables: {
          input,
        },
      }),
  }
}
