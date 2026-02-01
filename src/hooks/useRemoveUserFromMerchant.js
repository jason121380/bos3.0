import { gql, useMutation } from '@apollo/client'

const SET_REMOVE_USER = gql`
  mutation SET_REMOVE_USER($input: [String]!) {
    removeUserFromMerchant(input: $input)
  }
`

export default function useRemoveUserFromMerchant() {
  const [setRemoveUserFromMerchant] = useMutation(SET_REMOVE_USER)
  return {
    setRemoveUserFromMerchant: ({ input }) =>
      setRemoveUserFromMerchant({
        variables: {
          input,
        },
      }),
  }
}
