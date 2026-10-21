import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER = settingsQuery(gql`
  query GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER {
    getIsDailyCheckoutBlockedByDraftOrder
  }
`)

export default function useFetchGetisDailyCheckoutBlockedByDraftOrder() {
  return useQuery(GET_IS_DAILY_CHECKOUT_BLOCKED_BY_DRAFT_ORDER, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}