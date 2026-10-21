import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER = settingsQuery(gql`
  query GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER {
    getIsAbleToChangeDateTimeInOrderCreate
  }
`)

export default function useFetchGetIsAbleToChangeDateTimeInOrder() {
  return useQuery(GET_IS_ABLE_TO_CHANGE_DATE_TIME_IN_ORDER, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
