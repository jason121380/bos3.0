import { gql, useMutation } from '@apollo/client'

const SET_USER_SALARY_ITEM = gql`
  mutation SET_USER_SALARY_ITEM($input: SetUserSalaryItemInput!) {
    setUserSalaryItem(input: $input)
  }
`

export default function useFetchSettingUserSalaryItem() {
  const [setUserSalaryItem] = useMutation(SET_USER_SALARY_ITEM)
  return {
    setUserSalaryItem: ({ input }) =>
      setUserSalaryItem({
        variables: {
          input,
        },
      }),
  }
}
