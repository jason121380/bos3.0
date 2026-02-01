import { gql, useMutation } from '@apollo/client'

const FETCH_CLOSE_DAILY_ACCOUNT = gql`
  mutation closeDailyAccount($input: CloseDailyAccountInput!) {
    closeDailyAccount(input: $input)
  }
`

export default function useFetchCloseDailyAccount() {
  const [closeDailyAccount] = useMutation(FETCH_CLOSE_DAILY_ACCOUNT)
  return {
    closeDailyAccount: input =>
      closeDailyAccount({
        variables: {
          input,
        },
      }),
  }
}
