import { gql, useMutation } from '@apollo/client'

const CREATE_PAYMENT = gql`
  mutation CREATE_PAYMENT($input: PayWayInput!) {
    addPayWay(input: $input)
  }
`

export default function useFetchCreatePayment() {
  const [createPayment] = useMutation(CREATE_PAYMENT)
  return {
    createPayment: ({ input }) =>
      createPayment({
        variables: {
          input,
        },
      }),
  }
}
