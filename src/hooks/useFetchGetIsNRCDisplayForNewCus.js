import { gql, useQuery } from '@apollo/client'

export const GET_IS_NRC_DISPLAY_FOR_NEW_CUS = gql`
  query GET_IS_NRC_DISPLAY_FOR_NEW_CUS {
    getIsNRCDisplayForNewCus
  }
`

export default function useFetchGetIsNRCDisplayForNewCus() {
  return useQuery(GET_IS_NRC_DISPLAY_FOR_NEW_CUS, {
    fetchPolicy: 'cache-and-network',
  })
}
