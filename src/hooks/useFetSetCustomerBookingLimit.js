import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_BOOKING_LIMIT = gql`
  mutation SET_CUSTOMER_BOOKING_LIMIT($input: SetCustomerBookingLimitInput!) {
    setCustomerBookingLimit(input: $input)
  }
`

export default function useFetSetCustomerBookingLimit() {
  const [setCusBookingLimit] = useMutation(SET_CUSTOMER_BOOKING_LIMIT)
  return {
    setCusBookingLimit: ({ input }) =>
      setCusBookingLimit({
        variables: {
          input,
        },
      }),
  }
}