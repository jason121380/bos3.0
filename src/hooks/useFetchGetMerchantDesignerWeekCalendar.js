import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_DESIGNER_CALENDAR = gql`
  query getMerchantDesignerCalendar($input: MerchantDesignerCalendarInput!) {
    getMerchantDesignerWeekCalendar(input: $input) {
      merchantDesignerCalendar {
        designerId
        designerName
        designerNickname
        designerNo
        bookingLimit
        calendar {
          type
          ids
          startTime
          endTime
          timeCost
          nameToDisplay
          isDesignate
          bookingStatus
          isUnwelcome
          customerId
          customerCellphone
          remark
          remarkForCustomer
          isBookingCostUsing
          companionCount
          notificationDayCount
          notificationDate
          displayBirthdayIcon
          isCheckin
          isCusCheckRequired
          isDone
          createdOrderId
          isNoShow
        }
      }
      merchantUnappointCalendar {
        id
        date
      }
    }
  }
`

export default function useFetchGetMerchantDesignerWeekCalendar({ input }) {
  return useQuery(GET_MERCHANT_DESIGNER_CALENDAR, {
    variables: {
      input
    },
    fetchPolicy: 'cache-and-network',
  })
}