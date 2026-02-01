import { gql, useMutation } from '@apollo/client'
// 編輯會員卡類別
const MULTIPLE_UPDATE_MEMBERSHIP_CATEGORY = gql`
  mutation multipleUpdateMembershipCategory($input: MultipleUpdateMembershipCategoryInput!) {
    multipleUpdateMembershipCategory(input: $input)
  }
`
export default function useFetchMultipleUpdateMembershipCategory() {
  const [multipleUpdateMembershipCategory] = useMutation(MULTIPLE_UPDATE_MEMBERSHIP_CATEGORY)
  return {
    multipleUpdateMembershipCategory: input =>
      multipleUpdateMembershipCategory({
        variables: {
          input,
        },
      }),
  }
}
