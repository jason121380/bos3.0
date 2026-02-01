import { gql, useMutation } from '@apollo/client'

const FETCH_USER_GENERAL = gql`
  mutation UPDATE_USER_INFO($input: SetUserInfoInput!) {
    setUserInfo(input: $input)
  }
`

export default function useFetchUserGeneral() {
  const [fetchUpdateUserGeneral, { data }] = useMutation(FETCH_USER_GENERAL)
  return {
    data,
    fetchUpdateUserGeneral: input =>
      fetchUpdateUserGeneral({
        variables: {
          input,
        },
      }),
  }
}
