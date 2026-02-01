import { gql, useQuery } from '@apollo/client'

export const GET_MERCHANT_EXTERNAL_LINK = gql`
  query GET_MERCHANT_EXTERNAL_LINK {
    merchantExternalLink {
      id
      name
      url
      userAuth {
        id
        authorityName
      }
    }
  }
`

export default function useFetchGetMerchantExternalLink() {
  return useQuery(GET_MERCHANT_EXTERNAL_LINK, {
    fetchPolicy: 'cache-and-network',
  })
}