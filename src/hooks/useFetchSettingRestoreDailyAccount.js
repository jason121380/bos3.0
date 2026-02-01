import { gql, useMutation } from '@apollo/client'

const SET_RESTORE_DAILY_ACCOUNT = gql`
  mutation SET_RESTORE_DAILY_ACCOUNT($date: DateTime!, $password: String) {
    restoreDailyAccount(date: $date, password: $password)
  }
`

export default function useFetchSetRestoreDailyAccount() {
  const [setRestoreDailyAccount] = useMutation(SET_RESTORE_DAILY_ACCOUNT)
  return {
    setRestoreDailyAccount: ({ date, password }) =>
      setRestoreDailyAccount({
        variables: {
          date,
          password,
        },
      }),
  }
}
