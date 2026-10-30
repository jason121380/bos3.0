import { gql, useMutation } from '@apollo/client'

const SET_CREATE_RESIGNED_USER = gql`
  mutation SET_CREATE_RESIGNED_USER($userIds: [ID]) {
    createResignedUser(userIds: $userIds)
  }
`

export default function useFetchSetCreateResignedUser() {
  const [setCreateResignedUser] = useMutation(SET_CREATE_RESIGNED_USER)
  return {
    setCreateResignedUser: ({ userIds }) =>
      setCreateResignedUser({
        variables: {
          userIds,
        },
      }),
  }
}
