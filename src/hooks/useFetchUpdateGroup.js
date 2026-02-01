import { gql, useMutation } from '@apollo/client'

const FETCH_UPDATE_GROUP = gql`
  mutation UPDATE_USER_INFO($input: SetUserInfoInput!) {
    setUserInfo(input: $input)
  }
`

export default function useFetchUpdateGroup() {
  const [fetchUpdateGroup] = useMutation(FETCH_UPDATE_GROUP)
  return {
    fetch: ({ userGroupId, jobTitleId, merchantIds, userId }) =>
      merchantIds.length > 0
        ? fetchUpdateGroup({
            variables: {
              input: {
                userId,
                jobTitleId,
                userGroupId,
                merchantIds,
              },
            },
          })
        : fetchUpdateGroup({
            variables: {
              input: {
                userId,
                jobTitleId,
                userGroupId,
              },
            },
          }),
  }
}
