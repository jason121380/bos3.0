import { gql, useMutation } from '@apollo/client'

const FETCH_UPDATE_USER_MERCHANT_IDENTITY = gql`
  mutation FETCH_UPDATE_USER_MERCHANT_IDENTITY($input: UpdateUserMerchantIdentityInput!) {
    updateUserMerchantIdentity(input: $input) {
      designer {
        id
        name
      }
      MerchantUserAuthorityId
    }
  }
`

export default function useFetchUpdateUserMerchantIdentity() {
  const [updateUserMerchantIdentity] = useMutation(FETCH_UPDATE_USER_MERCHANT_IDENTITY)
  return {
    updateUserMerchantIdentity: input =>
      updateUserMerchantIdentity({
        variables: {
          input,
        },
      }),
  }
}
