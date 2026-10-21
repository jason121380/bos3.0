import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_UES_USEING_SETTING = settingsQuery(gql`
  query GET_UES_USEING_SETTING {
    getUESUsingSetting
  }
`)

export default function useFetchGetUESUsingSetting() {
  return useQuery(GET_UES_USEING_SETTING, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
