import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

export const GET_DESIGNER_NAME_DISPLAY_ON_INVOICE = settingsQuery(gql`
  query GET_DESIGNER_NAME_DISPLAY_ON_INVOICE {
    getDesignerNameDisplayOnInvoice
  }
`)

export default function useFetchGetDesignerNameDisplayOnInvoice() {
  return useQuery(GET_DESIGNER_NAME_DISPLAY_ON_INVOICE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
