import { gql, useQuery } from '@apollo/client'

const FETCH_MERCHANT_JOBTITLE = gql`
  {
    jobTitle(categoryId: 2) {
      id
      name
      sorting
      remark
    }
  }
`

export default function useFetchMerchantJobTitle() {
  const { called, loading, data } = useQuery(FETCH_MERCHANT_JOBTITLE)
  return {
    called,
    loading,
    data,
  }
}
