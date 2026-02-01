import { gql, useMutation } from '@apollo/client'

const SET_IS_BOOKING_TYPE_FOR_SOCKET = gql`
  mutation SET_IS_BOOKING_TYPE_FOR_SOCKET($input: [BookingTypeForSocketEnum]!) {
    setBookingTypeForSocket(input: $input)
  }
`
export default function useFetchSetBookingTypeForSocket() {
  const [setTypeForSocket] = useMutation(SET_IS_BOOKING_TYPE_FOR_SOCKET)
  return {
    setTypeForSocket: ({ input }) =>
      setTypeForSocket({
        variables: {
          input,
        },
      }),
  }
}
