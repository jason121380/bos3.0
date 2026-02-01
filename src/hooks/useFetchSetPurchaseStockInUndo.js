import { gql, useMutation } from '@apollo/client'

const SET_PURCHASE_STOCK_IN_UNDO = gql`
  mutation SET_PURCHASE_STOCK_IN_UNDO($input: SetPurchaseStockInInput!) {
    purchaseStockInUndo(input: $input)
  }
`

export default function useFetchSetPurchaseStockInUndo() {
  const [setStockInUndo] = useMutation(SET_PURCHASE_STOCK_IN_UNDO)
  return {
    setStockInUndo: ( input ) =>
      setStockInUndo({
        variables: {
          input,
        },
      }),
  }
}