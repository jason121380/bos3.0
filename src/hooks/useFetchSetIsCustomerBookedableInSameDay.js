import { gql, useMutation } from '@apollo/client'

const SET_IS_CUSTOMER_BOOKEDABLE_IN_SAME_DAY= gql`
  mutation setIsCustomerBookedableInSameDay($input: Boolean!) {
    setIsCustomerBookedableInSameDay (input: $input)
  }
`

export default function useFetchSetIsBookingLimitPerCellphoneInSameDay() {
  const [setIsCustomerBookedableInSameDay] = useMutation(SET_IS_CUSTOMER_BOOKEDABLE_IN_SAME_DAY)
  return {
    setIsCustomerBookedableInSameDay: ({ input }) =>
    setIsCustomerBookedableInSameDay({
        variables: {
          input,
        },
      }),
  }
}