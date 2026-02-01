import { gql, useMutation } from '@apollo/client'

const SET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT = gql`
  mutation SET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT($input: [ActionEnum]!) {
    setActionsBannedAfterDailyCheckout(input: $input)
  }
`

export default function useFetchSetActionsBannedAfterDailyCheckout() {
  const [setActionsBanned] = useMutation(SET_ACTIONS_BANNED_AFTER_DAILY_CHECKOUT)
  return {
    setActionsBanned: ({ input }) =>
      setActionsBanned({
        variables: {
          input,
        },
      }),
  }
}