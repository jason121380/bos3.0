import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_DETAIL_BOTTOMED = settingsQuery(gql`
  query GET_IS_DETAIL_BOTTOMED {
    getIsDetailBottomed
  }
`)

export default function useFetchIsDetailBottomed() {
  return useQuery(GET_IS_DETAIL_BOTTOMED, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
