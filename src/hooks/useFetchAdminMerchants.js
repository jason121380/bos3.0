import { gql, useQuery } from '@apollo/client'

const ADMIN_MERCHANTS = gql`
  {
    viewer {
      admin {
        merchants {
          id
          name
        }
      }
    }
  }
`

export default function useFetchAdminMerchants() {
  return useQuery(ADMIN_MERCHANTS)
}
