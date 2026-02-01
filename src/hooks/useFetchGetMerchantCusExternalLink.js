import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_CUS_EXTERNAL_LINK = gql`
  query MerchantCusExternalLink($isReplace: Boolean) {
    merchantCusExternalLink(isReplace: $isReplace) {
      id
      name
      url
      isTop
    }
  }
`

export default function useFetchGetMerchantCusExternalLink() {
  return useQuery(GET_MERCHANT_CUS_EXTERNAL_LINK, {
    fetchPolicy: 'cache-and-network',
  })
}