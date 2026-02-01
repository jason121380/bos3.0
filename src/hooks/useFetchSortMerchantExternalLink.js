import { gql, useMutation } from '@apollo/client'

const SORT_MERCHANT_EXTERNAL_LINK = gql`
  mutation SORT_MERCHANT_EXTERNAL_LINK($input: [ID]!) {
    sortMerchantExternalLink(input: $input)
  }
`

export default function useFetchSortMerchantExternalLink() {
  const [sortExternalLink] = useMutation(SORT_MERCHANT_EXTERNAL_LINK)
  return {
    sortExternalLink: ({ input }) =>
      sortExternalLink({
        variables: {
          input,
        },
      }),
  }
}
