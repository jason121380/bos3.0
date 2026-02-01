import { gql, useQuery } from '@apollo/client'

const GET_QRCODE_CHECKIN_MODE = gql`
  query GET_QRCODE_CHECKIN_MODE {
    getQrcodeCheckinCode
  }
`

export default function useFetchGetQrcodeCheckinCode() {
  return useQuery(GET_QRCODE_CHECKIN_MODE, {
    fetchPolicy: 'cache-and-network',
  })
}