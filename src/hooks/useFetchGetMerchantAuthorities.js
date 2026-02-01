import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_AUTHORITIES = gql`
  query GET_MERCHANT_AUTHORITIES {
    getMerchantAuthorities {
      id
      authorityName
      authoritySettings
      isDefault
      usingDesignerCount
    }
  }
`

export default function useFetchMerchantAuthorities() {
  return useQuery(GET_MERCHANT_AUTHORITIES, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_AUTHORITIES_NAME_ID = gql`
  query GET_MERCHANT_AUTHORITIES {
    getMerchantAuthorities {
      id
      authorityName
    }
  }
`

export function useFetchMerchantAuthoritiesNameAndId() {
  return useQuery(GET_MERCHANT_AUTHORITIES_NAME_ID, {
    fetchPolicy: 'cache-and-network',
  })
}
