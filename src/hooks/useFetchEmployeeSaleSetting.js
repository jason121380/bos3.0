import { gql, useMutation } from '@apollo/client'

const FETCH_SET_USER_RAKE = gql`
  mutation FETCH_SET_USER_RAKE($input: SetUserRakeInput!) {
    setUserRake(input: $input)
  }
`

export function useFetchSetUserRake() {
  const [fetchSetUserRake] = useMutation(FETCH_SET_USER_RAKE)
  return {
    fetchSetUserRake: input =>
      fetchSetUserRake({
        variables: {
          input,
        },
      }),
  }
}

const FETCH_UPDATE_USER_IDENTITY = gql`
  mutation FETCH_UPDATE_USER_IDENTITY($input: UpdateUserIdentityInput!) {
    updateUserIdentity(input: $input) {
      status
      designerId
      MerchantJobTitlePointId
    }
  }
`

export function useFetchUpdateUserIdentity() {
  const [fetchUpdateUserIdentity] = useMutation(FETCH_UPDATE_USER_IDENTITY)
  return {
    fetchUpdateUserIdentity: input =>
      fetchUpdateUserIdentity({
        variables: {
          input,
        },
      }),
  }
}
