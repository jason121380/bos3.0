import { gql, useMutation } from '@apollo/client'

const SET_CUS_BOOKING_REMARK_DISPLAY = gql`
  mutation SET_CUS_BOOKING_REMARK_DISPLAY($input: Boolean!) {
    setIsCusBookingRemarkDisplay(input: $input)
  }
`

export default function useFetchSetIsCusBookingRemarkDisplay() {
  const [setCusRemarkDisplay] = useMutation(SET_CUS_BOOKING_REMARK_DISPLAY)
  return {
    setCusRemarkDisplay: ({ input }) =>
      setCusRemarkDisplay({
        variables: {
          input,
        },
      }),
  }
}