import { gql, useMutation } from '@apollo/client'

const DELETE_MERCHANT_CUS_EXTERNAL_LINK = gql`
  mutation DELETE_MERCHANT_CUS_EXTERNAL_LINK($input: ID!) {
    deleteMerchantCusExternalLink(input: $input)
  }
`
export default function useFetchDeleteMerchantCusExternalLink() {
  const [deleteCusLink] = useMutation(DELETE_MERCHANT_CUS_EXTERNAL_LINK)
  return {
    deleteCusLink: input =>
      deleteCusLink({
        variables: {
          input,
        },
      }),
  }
}