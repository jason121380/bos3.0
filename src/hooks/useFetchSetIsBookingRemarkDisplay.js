import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_REMARK_DISPLAY = gql`
  mutation SET_BOOKING_REMARK_DISPLAY($input: Boolean!) {
    setIsBookingRemarkDisplay(input: $input)
  }
`

export default function useFetchSetIsBookingRemarkDisplay() {
  const [setRemarkDisplay] = useMutation(SET_BOOKING_REMARK_DISPLAY)
  return {
    setRemarkDisplay: ({ input }) =>
      setRemarkDisplay({
        variables: {
          input,
        },
      }),
  }
}