import { gql, useMutation } from '@apollo/client'

const SET_USER_AVATAR = gql`
  mutation SET_USER_AVATAR($file: Upload!) {
    setUserAvatar(file: $file)
  }
`

export default function useFetchSetUserAvatar() {
  const [setUserAvatar] = useMutation(SET_USER_AVATAR)
  return {
    setUserAvatar: ({ file }) =>
      setUserAvatar({
        variables: {
          file,
        },
      }),
  }
}
