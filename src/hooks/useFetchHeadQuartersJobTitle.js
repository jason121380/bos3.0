import { gql, useQuery } from '@apollo/client'

const FETCH_HEADQUATER_JOBTITLE = gql`
  {
    jobTitle(categoryId: 1) {
      id
      name
      sorting
      remark
    }
  }
`

export default function useFetchHeadQuarterJobTitle() {
  const { called, loading, data } = useQuery(FETCH_HEADQUATER_JOBTITLE)
  return {
    called,
    loading,
    data,
  }
}
