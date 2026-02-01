import { gql, useQuery } from '@apollo/client'

export const GET_SEAT_ORDER_DISPLAY = gql`
  query GET_SEAT_ORDER_DISPLAY {
    seatNumberStatus {
      orderId
      orderNo
      seatNumber
      updateTime
      customerName
      customerCellphone
      customerNo
      designerName
      designerNo
      isDesignate
      isSeatUsing
    }
  }
`

export default function useFetchSeatOrderDisplay() {
  return useQuery(GET_SEAT_ORDER_DISPLAY, {
    fetchPolicy: 'cache-and-network',
  })
}
