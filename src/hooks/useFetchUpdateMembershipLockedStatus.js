import { gql, useMutation } from '@apollo/client'
// 編輯會員卡類別
const UPDATE_MEMBERSHIP_LOCKED_STATUS = gql`
  mutation updateMembershipLockedStatus($input: UpdateMembershipLockedStatusInput!) {
    updateMembershipLockedStatus(input: $input)
  }
`
export default function useFetchUpdateMembershipLockedStatus() {
  const [updateMembershipLockedStatus] = useMutation(UPDATE_MEMBERSHIP_LOCKED_STATUS)
  return {
    updateMembershipLockedStatus: input =>
      updateMembershipLockedStatus({
        variables: {
          input,
        },
      }),
  }
}
