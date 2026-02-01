import { gql, useMutation } from '@apollo/client'

const UPDATE_PAYMENT = gql`
  mutation UPDATE_PAYMENT($id: ID!, $input: PayWayInput!) {
    updatePayWay(id: $id, input: $input)
  }
`

export default function useFetchUpdatePayment() {
  const [updatePayment] = useMutation(UPDATE_PAYMENT)
  return {
    updatePayment: ({ id, input }) =>
      updatePayment({
        variables: {
          id,
          input,
        },
      }),
  }
}
