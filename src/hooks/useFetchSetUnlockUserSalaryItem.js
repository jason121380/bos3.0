import { gql, useMutation } from '@apollo/client'

const SET_USER_SALARY_ITEM_UNLOCK = gql`
  mutation SET_USER_SALARY_ITEM_UNLOCK($date: DateTime) {
    unlockUserSalaryItem(date: $date)
  }
`

export default function useFetchSettingUserSalaryItemUnlock() {
  const [setUserSalaryItemUnlock] = useMutation(SET_USER_SALARY_ITEM_UNLOCK)
  return {
    setUserSalaryItemUnlock: ({ date }) =>
      setUserSalaryItemUnlock({
        variables: {
          date,
        },
      }),
  }
}
