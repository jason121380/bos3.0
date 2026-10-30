import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE = settingsQuery(gql`
  query GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE {
    getIsAutoSetPreferDesignerForOrderCreate
  }
`)

export default function useFetchGetIsAutoSetPreferDesignerForOrderCreate() {
  return useQuery(GET_IS_AUTO_SET_PREFER_DESIGNER_FOR_ORDER_CREATE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
