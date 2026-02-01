import { gql, useQuery } from '@apollo/client'

const ADMIN_MERCHANT_DESIGNER = gql`
  query($designers: UsersInput!) {
    viewer {
      admin {
        designers(input: $designers) {
          users {
            id
            name
          }
        }
      }
    }
  }
`

export default function useFetchAllMerchantDesigner(params) {
  const designers = params && params.designers ? params.designers : {}
  return useQuery(ADMIN_MERCHANT_DESIGNER, {
    variables: {
      designers,
    },
  })
}
