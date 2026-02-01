import { gql, useMutation } from '@apollo/client'

const SET_CLOSE_CUSTOMER_BOOKING = gql`
  mutation SET_CLOSE_CUSTOMER_BOOKING($input: Boolean!) {
    setCloseCustomerBooking(input: $input)
  }
`
export default function useFetchSetCloseCustomerBooking() {
  const [setCloseCustomerBooking] = useMutation(SET_CLOSE_CUSTOMER_BOOKING)
  return {
    setCloseCustomerBooking: ({ input }) =>
      setCloseCustomerBooking({
        variables: {
          input,
        },
      }),
  }
}
