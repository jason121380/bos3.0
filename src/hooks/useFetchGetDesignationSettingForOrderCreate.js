import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_DESIGNATION_SETTING_FOR_ORDER_CREATE = settingsQuery(gql`
  query GET_DESIGNATION_SETTING_FOR_ORDER_CREATE {
    getDesignationSettingForOrderCreate
  }
`)

export default function useFetchGetDesignationSettingForOrderCreate() {
  return useQuery(GET_DESIGNATION_SETTING_FOR_ORDER_CREATE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
