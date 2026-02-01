import { gql, useMutation } from '@apollo/client'

const SORT_MERCHANT_CUS_EXTERNAL_LINK = gql`
  mutation SORT_MERCHANT_CUS_EXTERNAL_LINK($input: [ID]!) {
    sortMerchantCusExternalLink(input: $input)
  }
`

export default function useFetchSortMerchantCusExternalLink() {
  const [sortExternalLink] = useMutation(SORT_MERCHANT_CUS_EXTERNAL_LINK)
  return {
    sortExternalLink: ({ input }) =>
      sortExternalLink({
        variables: {
          input,
        },
      }),
  }
}
