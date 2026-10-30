import { gql, useMutation } from '@apollo/client'

const UPDATE_MERCHANT_CUS_EXTERNAL_LINK = gql`
  mutation UPDATE_MERCHANT_CUS_EXTERNAL_LINK($input: UpdateMerchantCusExternalLinkInput!) {
    updateMerchantCusExternalLink(input: $input)
  }
`
export default function useFetchUpdateMerchantCusExternalLink() {
  const [updateCusLink] = useMutation(UPDATE_MERCHANT_CUS_EXTERNAL_LINK)
  return {
    updateCusLink: input =>
      updateCusLink({
        variables: {
          input,
        },
      }),
  }
}
