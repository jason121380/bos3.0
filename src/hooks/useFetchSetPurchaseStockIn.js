import { gql, useMutation } from '@apollo/client'

const SET_PURCHASE_STOCK_IN = gql`
  mutation SET_PURCHASE_STOCK_IN($input: SetPurchaseStockInInput!) {
    purchaseStockIn(input: $input)
  }
`

export default function useFetchSetPurchaseStockIn() {
  const [setStockIn] = useMutation(SET_PURCHASE_STOCK_IN)
  return {
    setStockIn: ( input ) =>
      setStockIn({
        variables: {
          input,
        },
      }),
  }
}