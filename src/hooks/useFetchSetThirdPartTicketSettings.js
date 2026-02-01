import { gql, useMutation } from '@apollo/client'

const SET_THIRD_PART_TICKET_DISPLAY = gql`
  mutation SET_THIRD_PART_TICKET_DISPLAY($input: Boolean!) {
    setThirdPartTicketDisplay(input: $input)
  }
`

export default function useFetchSetThirdPartTicketSettings() {
  const [setThirdPartTicketDisplay] = useMutation(SET_THIRD_PART_TICKET_DISPLAY)
  return {
    setThirdPartTicketDisplay: ({ input }) =>
      setThirdPartTicketDisplay({
        variables: {
          input,
        },
      }),
  }
}
