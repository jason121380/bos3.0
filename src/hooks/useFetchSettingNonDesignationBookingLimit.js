import { gql, useMutation } from '@apollo/client'

const SET_NON_DESIGNATE_BOOKING_LIMIT = gql`
  mutation SET_NON_DESIGNATE_BOOKING_LIMIT($count: Int!) {
    setNonDesignationBookingLimit(count: $count)
  }
`

export default function useFetchSetNonDesignationBookingLimit() {
  const [setNonDesignationBookingLimit] = useMutation(SET_NON_DESIGNATE_BOOKING_LIMIT)
  return {
    setNonDesignationBookingLimit: ({ count }) =>
      setNonDesignationBookingLimit({
        variables: {
          count,
        },
      }),
  }
}
