import { gql, useMutation } from '@apollo/client'
// 編輯會員卡
const UPDATE_MEMBERSHIP = gql`
  mutation updateMembership($input: UpdateMembershipInput!) {
    updateMembership(input: $input)
  }
`

export default function useFetchUpdateMembership() {
  const [updateMembership] = useMutation(UPDATE_MEMBERSHIP)
  return {
    updateMembership: input =>
      updateMembership({
        variables: {
          input,
        },
      }),
  }
}
