import { gql, useQuery } from '@apollo/client'

const GET_HELPER_DESIGNATION_DISPLAY = gql`
  query GET_HELPER_DESIGNATION_DISPLAY {
    getIsHelperDesignationDisplay
  }
`

export default function useFetchGetIsHelperDesignationSetting() {
  return useQuery(GET_HELPER_DESIGNATION_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
