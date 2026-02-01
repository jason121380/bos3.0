import { gql, useMutation } from '@apollo/client'
// 建立會員卡
const CREATE_MEMBERSHIP = gql`
  mutation createMembership($input: CreateMembershipInput!) {
    createMembership(input: $input)
  }
`
export default function useFetchCreateMembership() {
  const [createMembership] = useMutation(CREATE_MEMBERSHIP)
  return {
    createMembership: input =>
      createMembership({
        variables: {
          input,
        },
      }),
  }
}
