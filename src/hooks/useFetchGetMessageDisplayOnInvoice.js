import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MESSAGE_DISPLAY_ON_INVOICE = settingsQuery(gql`
  query GET_MESSAGE_DISPLAY_ON_INVOICE {
    getMessageDisplayOnInvoice {
      isDisplay
      message
    }
  }
`)

export default function useFetchGetMessageDisplayOnInvoice() {
  return useQuery(GET_MESSAGE_DISPLAY_ON_INVOICE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}