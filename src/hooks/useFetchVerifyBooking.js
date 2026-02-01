import { gql, useMutation } from '@apollo/client'

const VERIFY_BOOKING = gql`
  mutation verifyBooking($input: VerifyBookingInput!) {
    verifyBooking(input: $input) {
      id
      date
      status
      no
      serviceCategory {
        id
        name
      }
      isDesignate
      customer {
        id
        name
        cellphone
      }
      designer {
        id
        name
        cellphone
      }
      friends {
        customer {
          id
          name
          cellphone
        }
      }
    }
  }
`

export default function useFetchVerifyBooking() {
  const [verifyBooking] = useMutation(VERIFY_BOOKING)

  return {
    verifyBooking: input =>
      verifyBooking({
        variables: {
          input,
        },
      }),
  }
}
