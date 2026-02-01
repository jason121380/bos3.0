import { gql, useMutation } from '@apollo/client'

const UPDATE_UPDATE_THIRD_PARTY_COUPON = gql`
  mutation UPDATE_UPDATE_THIRD_PARTY_COUPON($id: ID!, $input: AddThirdPartTicketInput!) {
    updateThirdPartTicket(id: $id, input: $input)
  }
`

export default function useFetchUpdateThirdPartyCoupon() {
  const [updateThirdPartyCoupon] = useMutation(UPDATE_UPDATE_THIRD_PARTY_COUPON)
  return {
    updateThirdPartyCoupon: ({ id, input }) =>
      updateThirdPartyCoupon({
        variables: {
          id,
          input,
        },
      }),
  }
}
