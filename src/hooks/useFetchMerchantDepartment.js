import { gql, useQuery } from '@apollo/client'

const FETCH_MERCHANT_DEPARTMENT = gql`
  {
    userGroup(categoryId: 2) {
      id
      name
      no
      groups {
        id
        name
        no
        groups {
          id
          name
          no
          groups {
            id
            name
          }
          merchants {
            id
            name
          }
        }
        merchants {
          id
          name
        }
      }
      merchants {
        id
        name
      }
    }
  }
`

export default function useFetchMerchantDepartment() {
  const { called, loading, data } = useQuery(FETCH_MERCHANT_DEPARTMENT)
  return { called, loading, data }
}
