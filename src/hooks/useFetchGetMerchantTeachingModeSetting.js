import { gql, useQuery } from '@apollo/client'

const GET_TEACHING_MODE_DISPLAY = gql`
  query GET_TEACHING_MODE_DISPLAY {
    getMerchantTeachingModeSetting
  }
`

export default function useFetchMerchantTeachingModeSetting() {
  return useQuery(GET_TEACHING_MODE_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
