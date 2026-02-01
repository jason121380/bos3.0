import { gql, useQuery } from '@apollo/client'

export const GET_DESIGNATION_SETTING_FOR_ORDER_CREATE = gql`
  query GET_DESIGNATION_SETTING_FOR_ORDER_CREATE {
    getDesignationSettingForOrderCreate
  }
`

export default function useFetchGetDesignationSettingForOrderCreate() {
  return useQuery(GET_DESIGNATION_SETTING_FOR_ORDER_CREATE, {
    fetchPolicy: 'cache-and-network',
  })
}
