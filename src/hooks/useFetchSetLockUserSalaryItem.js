import { gql, useMutation } from '@apollo/client'

const SET_USER_SALARY_ITEM_LOCK = gql`
  mutation SET_USER_SALARY_ITEM_LOCK($date: DateTime) {
    lockUserSalaryItem(date: $date)
  }
`

export default function useFetchSettingUserSalaryItemLock() {
  const [setUserSalaryItemLock] = useMutation(SET_USER_SALARY_ITEM_LOCK)
  return {
    setUserSalaryItemLock: ({ date }) =>
      setUserSalaryItemLock({
        variables: {
          date,
        },
      }),
  }
}
