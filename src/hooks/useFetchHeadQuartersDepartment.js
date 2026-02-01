import { gql, useQuery } from '@apollo/client'

const FETCH_HEADQUARTER_DEPARTMENT = gql`
  {
    userGroup(categoryId: 1) {
      id
      name
      no
    }
  }
`

export default function useFetchHeadQuarterDepartment() {
  const { called, loading, data } = useQuery(FETCH_HEADQUARTER_DEPARTMENT)
  return { called, loading, data }
}
