import { gql, useMutation } from '@apollo/client'

const UPDATE_PURCHASE = gql`
  mutation UPDATE_PURCHASE($input: [UpdatePurchaseInput]!) {
    updatePurchase(input: $input)
  }
`

export default function useFetchSetUpdatePurchaseRecord() {
  const [updatePurchase] = useMutation(UPDATE_PURCHASE)
  return {
    updatePurchase: ({ input }) =>
      updatePurchase({
        variables: {
          input,
        },
      }),
  }
}
