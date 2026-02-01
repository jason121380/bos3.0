import { gql, useMutation } from '@apollo/client'

const CREATE_PURCHASE = gql`
  mutation CREATE_PURCHASE($input: [CreatePurchaseInput]!) {
    createPurchase(input: $input)
  }
`

export default function useFetchCreatePurchase() {
  const [addPurchase] = useMutation(CREATE_PURCHASE)
  return {
    addPurchase: ({ input }) =>
      addPurchase({
        variables: {
          input,
        },
      }),
  }
}
