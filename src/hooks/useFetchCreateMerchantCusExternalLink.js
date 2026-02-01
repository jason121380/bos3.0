import { gql, useMutation } from '@apollo/client'

const CREATE_MERCHANT_CUS_EXTERNAL_LINK = gql`
  mutation CREATE_MERCHANT_CUS_EXTERNAL_LINK($input: CreateMerchantCusExternalLinkInput!) {
    createMerchantCusExternalLink(input: $input)
  }
`
export default function useFetchCreateMerchantCusExternalLink() {
  const [createCusLink] = useMutation(CREATE_MERCHANT_CUS_EXTERNAL_LINK)
  return {
    createCusLink: input =>
      createCusLink({
        variables: {
          input,
        },
      }),
  }
}