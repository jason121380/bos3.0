import { gql, useMutation } from '@apollo/client'
// 建立會員卡類別
const CREATE_MEMBERSHIP_CATEGORY = gql`
  mutation createMembershipCategory($input: CreateMembershipCategoryinput!) {
    createMembershipCategory(input: $input)
  }
`
export default function useFetchCreateMembershipCategory() {
  const [createMembershipCategory] = useMutation(CREATE_MEMBERSHIP_CATEGORY)
  return {
    createMembershipCategory: input =>
      createMembershipCategory({
        variables: {
          input,
        },
      }),
  }
}
