import { gql, useLazyQuery } from '@apollo/client'

const FETCH_DESIGNER_BOOKING_TIMES = gql`
  query designerBookingTimes($GetBookingTimesInput: GetBookingTimesInput!) {
    getBookingTimes(input: $GetBookingTimesInput) {
      time
      status
      orders {
        id
        status
        isReserved
        isDesignate
        isBookingCostUsing
      }
    }
  }
`
export const useLazyFetchDesignerBookingTimes = ({ designerId, storeId, date }) => {
  const [fetchDesignerBookingTimes, designerBookingTimesResponse] = useLazyQuery(
    FETCH_DESIGNER_BOOKING_TIMES,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        GetBookingTimesInput: {
          designerId,
          storeId,
          date,
        },
      },
    }
  )
  return {
    fetchDesignerBookingTimes,
    designerBookingTimesResponse,
  }
}
