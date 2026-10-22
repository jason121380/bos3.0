import { gql, useLazyQuery } from '@apollo/client'

const FETCH_UNSPECIFIED_BOOKING_TIMES = gql`
  query unspecifiedBookingTimes($UnspecifiedBookingTimesInput: UnspecifiedBookingTimesInput!) {
    unspecifiedBookingTimes(input: $UnspecifiedBookingTimesInput) {
      time
      status
    }
  }
`
export const useLazyFetchUnspecifiedBookingTimes = ({ storeId, date }) => {
  const [fetchUnspecifiedBookingTimes, unspecifiedBookingTimesResponse] = useLazyQuery(
    FETCH_UNSPECIFIED_BOOKING_TIMES,
    {
      fetchPolicy: 'cache-and-network',
      variables: {
        UnspecifiedBookingTimesInput: {
          storeId,
          date,
        },
      },
    }
  )
  return {
    fetchUnspecifiedBookingTimes,
    unspecifiedBookingTimesResponse,
  }
}