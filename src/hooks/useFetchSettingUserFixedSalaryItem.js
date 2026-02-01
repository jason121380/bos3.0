import { gql, useMutation } from '@apollo/client'

const SET_USER_FIXED_SALARY_ITEM = gql`
  mutation SET_USER_FIXED_SALARY_ITEM($input: SetUserFixedSalaryItemInput!) {
    setUserFixedSalaryItem(input: $input)
  }
`

export default function useFetchSettingUserFixedSaleryItem() {
  const [setUserFixedSalaryItem] = useMutation(SET_USER_FIXED_SALARY_ITEM)
  return {
    setUserFixedSalaryItem: ({ input }) =>
      setUserFixedSalaryItem({
        variables: {
          input,
        },
      }),
  }
}
