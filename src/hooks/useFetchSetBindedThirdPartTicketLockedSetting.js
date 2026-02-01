import { gql, useMutation } from '@apollo/client'

const SET_BINDED_THIRD_PARTY_TICKET_LOCKED_SETTING = gql`
  mutation SET_BINDED_THIRD_PARTY_TICKET_LOCKED_SETTING($input: SetBindedThirdPartTicketLockedSettingInput!) {
    setBindedThirdPartTicketLockedSetting(input: $input)
  }
`

export default function useFetchSetBindedThirdPartTicketLockedSetting() {
  const [setBindedThirdPartTicketLockedSetting] = useMutation(SET_BINDED_THIRD_PARTY_TICKET_LOCKED_SETTING)
  return {
    setBindedThirdPartTicketLockedSetting: ({ input }) =>
    setBindedThirdPartTicketLockedSetting({
        variables: {
          input,
        },
      }),
  }
}
