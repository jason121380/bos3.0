import { gql, useMutation } from '@apollo/client'

const SET_IS_BOOKING_ITEM_REQUIRED = gql`
  mutation setIsBookingItemRequired($input: Boolean!) {
    setIsBookingItemRequired (input: $input)
  }
`

export default function useFetchSetIsBookingItemRequired() {
  const [setIsBookingItemRequired] = useMutation(SET_IS_BOOKING_ITEM_REQUIRED)
  return {
    setIsBookingItemRequired: ({ input }) =>
      setIsBookingItemRequired({
        variables: {
          input,
        },
      }),
  }
}