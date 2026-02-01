import { gql, useMutation } from '@apollo/client'

const SET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL = gql`
  mutation SET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL($input: Boolean!) {
    setIntoPerformanceDisplayForTicketSellDefault(input: $input)
  }
`

export default function useFetchSettingIntoPerformanceDisplayForTicketSellDefault() {
  const [setIntoPerformanceDisplayForTicketSellDefault] = useMutation(
    SET_INTO_PERFORMANCE_DISPLAY_FOR_TICKET_SELL
  )
  return {
    setIntoPerformanceDisplayForTicketSellDefault: ({ input }) =>
      setIntoPerformanceDisplayForTicketSellDefault({
        variables: {
          input,
        },
      }),
  }
}
