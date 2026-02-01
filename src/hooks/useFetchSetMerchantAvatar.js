import { gql, useMutation } from '@apollo/client'

const SET_MERCHANT_AVATAR = gql`
  mutation SET_MERCHANT_AVATAR($file: Upload!) {
    setMerchantAvatar(file: $file)
  }
`

export default function useFetchSetMerchantAvatar() {
  const [setMerchantAvatar] = useMutation(SET_MERCHANT_AVATAR)
  return {
    setMerchantAvatar: ({ file }) =>
      setMerchantAvatar({
        variables: {
          file,
        },
      }),
  }
}
