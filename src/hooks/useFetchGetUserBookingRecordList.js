import { gql, useQuery } from '@apollo/client'

const GET_USER_BOOKING_RECORD_LIST = gql`
  query GET_USER_BOOKING_RECORD_LIST {
    getUserBookingRecordList {
      userId
      userName
      userNickName
      userNo
    }
  }
`

export default function useFetchGetUserBookingRecordList() {
  return useQuery(GET_USER_BOOKING_RECORD_LIST, {
    fetchPolicy: 'cache-and-network',
  })
}
