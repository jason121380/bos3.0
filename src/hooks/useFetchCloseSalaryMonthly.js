import { gql, useMutation } from '@apollo/client'

const FETCH_CLOSE_SALARY_MONTHLY = gql`
  mutation closeSalaryMonthly($input: CloseSalaryMonthlyInput!) {
    closeSalaryMonthly(input: $input)
  }
`

export default function useFetchCloseSalaryMonthly() {
  const [closeSalaryMonthly] = useMutation(FETCH_CLOSE_SALARY_MONTHLY)
  return {
    closeSalaryMonthly: input =>
      closeSalaryMonthly({
        variables: {
          input,
        },
      }),
  }
}
