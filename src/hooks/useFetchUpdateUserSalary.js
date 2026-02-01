import { gql, useMutation } from '@apollo/client'

const FETCH_UPDATE_USER_SALARY = gql`
  mutation UpdateUserSalary($input: UpdateUserSalary!) {
    updateUserSalary(input: $input) {
      id
    }
  }
`

export default function useFetchUpdateUserSalary() {
  const [updateUserSalary] = useMutation(FETCH_UPDATE_USER_SALARY)
  return {
    updateUserSalary: input =>
      updateUserSalary({
        variables: {
          input,
        },
      }),
  }
}
