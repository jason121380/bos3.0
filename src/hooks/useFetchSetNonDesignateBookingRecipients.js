import { gql, useMutation } from '@apollo/client'

const SET_NONDESIGNATE_BOOKING_RECIOIENTS = gql`
  mutation SET_NONDESIGNATE_BOOKING_RECIOIENTS($userIds: [ID] = []) {
    setNonDesignateBookingRecipients(userIds: $userIds)
  }
`

export default function useFetchSetNonDesignateBookingRecipients() {
  const [setBookingRecipients] = useMutation(SET_NONDESIGNATE_BOOKING_RECIOIENTS)
  return {
    setBookingRecipients: ({ userIds }) =>
      setBookingRecipients({
        variables: {
          userIds,
        },
      }),
  }
}
