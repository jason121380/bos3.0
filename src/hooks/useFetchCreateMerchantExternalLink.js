import { gql, useMutation } from '@apollo/client'

const CREATE_MERCHANT_EXTERNAL_LINK = gql`
  mutation CREATE_MERCHANT_EXTERNAL_LINK($input: CreateMerchantExternalLinkInput!) {
    createMerchantExternalLink(input: $input)
  }
`
export default function useFetchCreateMerchantExternalLink() {
  const [createLink] = useMutation(CREATE_MERCHANT_EXTERNAL_LINK)
  return {
    createLink: input =>
      createLink({
        variables: {
          input,
        },
      }),
  }
}