import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT = settingsQuery(gql`
  query GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT {
    getIsOpenDateRangeInOrderMangement
  }
`)

export default function useFetchGetIsOpenDateRangeInOrderMangement() {
  return useQuery(GET_IS_OPEN_DATE_RANGE_IN_ORDER_MANGEMENT, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
