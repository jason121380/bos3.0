import { gql, useMutation } from '@apollo/client'

const SET_BOOKING_NO_SHOW = gql`
  mutation SET_BOOKING_NO_SHOW($input: SetBookingNoShowInput!) {
    setBookingNoShow(input: $input)
  }
`

export default function useFetchSetBookingNoShow() {
  const [setBookingNoShow] = useMutation(SET_BOOKING_NO_SHOW)
  return {
    setBookingNoShow: ({ input }) =>
      setBookingNoShow({
        variables: {
          input,
        },
      }),
  }
}