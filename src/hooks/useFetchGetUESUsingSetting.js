import { gql, useQuery } from '@apollo/client'

const GET_UES_USEING_SETTING = gql`
  query GET_UES_USEING_SETTING {
    getUESUsingSetting
  }
`

export default function useFetchGetUESUsingSetting() {
  return useQuery(GET_UES_USEING_SETTING, {
    fetchPolicy: 'cache-and-network',
  })
}
