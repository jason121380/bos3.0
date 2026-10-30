import { gql, useMutation } from '@apollo/client'

const UPDATE_MERCHANT_EXTERNAL_LINK = gql`
  mutation UPDATE_MERCHANT_EXTERNAL_LINK($input: UpdateMerchantExternalLinkInput!) {
    updateMerchantExternalLink(input: $input)
  }
`
export default function useFetchUpdateMerchantExternalLink() {
  const [updateLink] = useMutation(UPDATE_MERCHANT_EXTERNAL_LINK)
  return {
    updateLink: input =>
      updateLink({
        variables: {
          input,
        },
      }),
  }
}
