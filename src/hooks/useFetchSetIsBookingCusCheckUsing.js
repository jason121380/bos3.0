import { gql, useMutation } from '@apollo/client'

const SET_IS_BOOKING_CUS_CHECK_USING = gql`
  mutation SET_IS_BOOKING_CUS_CHECK_USING($input: Boolean!) {
    setIsBookingCusCheckUsing(input: $input)
  }
`
export default function useFetchSetIsBookingCusCheckUsing() {
  const [setIsBookingCusCheckUsing] = useMutation(SET_IS_BOOKING_CUS_CHECK_USING)
  return {
    setIsBookingCusCheckUsing: ({ input }) =>
      setIsBookingCusCheckUsing({
        variables: {
          input,
        },
      }),
  }
}
