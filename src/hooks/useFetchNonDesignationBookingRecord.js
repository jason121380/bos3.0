import { gql, useQuery } from '@apollo/client'

const FETCH_NON_DESIGNATION_BOOKING_RECORD = gql`
  query FETCH_NON_DESIGNATION_BOOKING_RECORD($startDate: DateTime!, $endDate: DateTime!) {
    nonDesignationBookingRecord(startDate: $startDate, endDate: $endDate) {
      id
      isDesignate
      status
      customer {
        id
        name
        cellphone
      }
      date
      endDate
      nonDesignateId
      remark
      remarkForCustomer
      timeCost
    }
  }
`

export default function useFetchNonDesignationBookingRecord({ startDate, endDate }) {
  return useQuery(FETCH_NON_DESIGNATION_BOOKING_RECORD, {
    variables: {
      startDate,
      endDate,
    },
    fetchPolicy: 'cache-and-network',
  })
}
