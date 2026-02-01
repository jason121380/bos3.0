import { gql, useMutation } from '@apollo/client'

export const NON_DESIGNATION_BOOKING = gql`
  mutation NON_DESIGNATION_BOOKING($input: NonDesignationBookingInput!) {
    nonDesignationBooking(input: $input) {
      id
      status
      date
      nonDesignateId
    }
  }
`

export default function useFetchNonDesignationBooking() {
  const [nonDesignationBooking] = useMutation(NON_DESIGNATION_BOOKING)
  return {
    nonDesignationBooking: input =>
      nonDesignationBooking({
        variables: {
          input,
        },
      }),
  }
}
