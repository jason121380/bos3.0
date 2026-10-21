import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_QRCODE_CHECKIN_MODE = settingsQuery(gql`
  query GET_QRCODE_CHECKIN_MODE {
    getQrcodeCheckinCode
  }
`)

export default function useFetchGetQrcodeCheckinCode() {
  return useQuery(GET_QRCODE_CHECKIN_MODE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}