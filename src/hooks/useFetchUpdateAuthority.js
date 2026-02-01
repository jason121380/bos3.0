import { gql, useMutation } from '@apollo/client'

const UPDATE_AUTHORITY = gql`
  mutation UPDATE_AUTHORITY($authorityId: ID!, $settings: String!, $authorityName: String!) {
    updateAuthority(authorityId: $authorityId, settings: $settings, authorityName: $authorityName)
  }
`

export default function useFetchUpdateAuthority() {
  const [updateAuthority] = useMutation(UPDATE_AUTHORITY)
  return {
    updateAuthority: ({ authorityId, settings, authorityName }) =>
      updateAuthority({
        variables: {
          authorityId,
          settings,
          authorityName,
        },
      }),
  }
}
