import { gql, useLazyQuery } from '@apollo/client'

const CHECK_PAGE_AUTHORITY = gql`
  query CHECK_PAGE_AUTHORITY($input: checkPageAuthorityInput!) {
    checkPageAuthority(input: $input)
  }
`

export default function useFetchCheckPageAuthority() {
  const [checkPageAuthorityLazy, checkPageAuthorityData] = useLazyQuery(CHECK_PAGE_AUTHORITY, {
    fetchPolicy: 'cache-and-network',
  })
  return [checkPageAuthorityLazy, checkPageAuthorityData]
}
