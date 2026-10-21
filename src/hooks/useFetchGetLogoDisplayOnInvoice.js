import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_LOGO_DISPLAY_INVOICE = settingsQuery(gql`
  query GET_LOGO_DISPLAY_INVOICE {
    getLogoDisplayOnInvoice {
      isDisplay
      imageUrl
    }
  }
`)

export default function useFetchGetLogoDisplayOnInvoice() {
  return useQuery(GET_LOGO_DISPLAY_INVOICE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}