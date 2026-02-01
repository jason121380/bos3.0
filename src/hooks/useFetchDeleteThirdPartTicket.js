import { gql, useMutation } from '@apollo/client'

const DELETE_THIRD_PARTY_COUPON = gql`
  mutation DELETE_THIRD_PARTY_COUPON($id: ID!) {
    deleteThirdPartTicket(id: $id)
  }
`

export default function useFetchDeleteThirdPartyCoupon() {
  const [deleteThirdPartyCoupon] = useMutation(DELETE_THIRD_PARTY_COUPON)
  return {
    deleteThirdPartyCoupon: ({ id }) => deleteThirdPartyCoupon({ variables: { id } }),
  }
}
