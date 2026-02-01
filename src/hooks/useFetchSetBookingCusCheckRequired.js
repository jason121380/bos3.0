import { gql, useMutation } from '@apollo/client'

const SET_IS_BOOKING_CUS_CHECK_REQUIRED = gql`
  mutation SET_IS_BOOKING_CUS_CHECK_REQUIRED($input: SetBookingCusCheckRequiredInput!) {
    setBookingCusCheckRequired(input: $input)
  }
`
export default function useFetchSetBookingCusCheckRequired() {
  const [setBookingCusCheckRequired] = useMutation(SET_IS_BOOKING_CUS_CHECK_REQUIRED)
  return {
    setBookingCusCheckRequired: ({ input }) =>
      setBookingCusCheckRequired({
        variables: {
          input,
        },
      }),
  }
}
