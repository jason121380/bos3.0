import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_QRCODE_DISPLAY_ON_INVOICE = settingsQuery(gql`
  query GET_QRCODE_DISPLAY_ON_INVOICE {
    getQrcodeDisplayOnInvoice {
      isDisplay
      url
      imageUrl
    }
  }
`)

export default function useFetchGetQrcodeDisplayOnInvoice() {
  return useQuery(GET_QRCODE_DISPLAY_ON_INVOICE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}