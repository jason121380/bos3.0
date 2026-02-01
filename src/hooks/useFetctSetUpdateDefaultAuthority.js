import { gql, useMutation } from '@apollo/client'

const SET_UPDATE_DEFAULT_AUTHORITY = gql`
  mutation SET_UPDATE_DEFAULT_AUTHORITY($authorityId: ID!) {
    updateDefaultAuthority(authorityId: $authorityId)
  }
`

export default function useFetchSettingUpdateDefaultAuthority() {
  const [setUpdateDefaultAuthority] = useMutation(SET_UPDATE_DEFAULT_AUTHORITY)
  return {
    setUpdateDefaultAuthority: ({ authorityId }) =>
      setUpdateDefaultAuthority({
        variables: {
          authorityId,
        },
      }),
  }
}
