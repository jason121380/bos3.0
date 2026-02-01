import { gql, useMutation } from '@apollo/client'

const SET_IS_BOOKING_LIMIT_PER_CELLPHONE_IN_SAME_DAY = gql`
  mutation setBookingLimitPerCellphoneInSameDay($input: Int) {
    setBookingLimitPerCellphoneInSameDay (input: $input)
  }
`

export default function useFetchSetIsBookingLimitPerCellphoneInSameDay() {
  const [setIsBookingLimitPerCellphoneInSameDay] = useMutation(SET_IS_BOOKING_LIMIT_PER_CELLPHONE_IN_SAME_DAY)
  return {
    setIsBookingLimitPerCellphoneInSameDay: ({ input }) =>
    setIsBookingLimitPerCellphoneInSameDay({
        variables: {
          input,
        },
      }),
  }
}