import { gql, useMutation } from '@apollo/client'

const DELETE_MERCHANT_EXTERNAL_LINK = gql`
  mutation DELETE_MERCHANT_EXTERNAL_LINK($input: ID!) {
    deleteMerchantExternalLink(input: $input)
  }
`
export default function useFetchDeleteMerchantExternalLink() {
  const [deleteLink] = useMutation(DELETE_MERCHANT_EXTERNAL_LINK)
  return {
    deleteLink: input =>
      deleteLink({
        variables: {
          input,
        },
      }),
  }
}