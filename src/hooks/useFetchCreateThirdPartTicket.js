import { gql, useMutation } from '@apollo/client'

const CREATE_THIRD_PARTY_COUPON = gql`
  mutation CREATE_THIRD_PARTY_COUPON($input: AddThirdPartTicketInput!) {
    addThirdPartTicket(input: $input)
  }
`

export default function useFetchCreateThirdPartyCoupon() {
  const [createThirdPartyCoupon] = useMutation(CREATE_THIRD_PARTY_COUPON)
  return {
    createThirdPartyCoupon: ({ input }) =>
      createThirdPartyCoupon({
        variables: {
          input,
        },
      }),
  }
}
