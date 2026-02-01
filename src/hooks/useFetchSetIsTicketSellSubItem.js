import { gql, useMutation } from '@apollo/client'

const SET_IS_TICKET_SELL_SUB_ITEM = gql`
  mutation SET_IS_TICKET_SELL_SUB_ITEM($input: Boolean!) {
    setIsTicketSellSubItem(input: $input)
  }
`

export default function useFetchSetIsTicketSellSubItem() {
  const [setTicketSellSubItem] = useMutation(SET_IS_TICKET_SELL_SUB_ITEM)
  return {
    setTicketSellSubItem: ({ input }) =>
      setTicketSellSubItem({
        variables: {
          input,
        },
      }),
  }
}