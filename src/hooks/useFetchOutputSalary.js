import { gql, useMutation } from '@apollo/client'

const FETCH_OUTPUT_SALARY = gql`
  mutation OutputSalary($input: outputSalaryInput!) {
    outputSalary(input: $input)
  }
`

export default function useFetchOutputSalary() {
  const [outputSalary] = useMutation(FETCH_OUTPUT_SALARY)
  return {
    outputSalary: date =>
      outputSalary({
        variables: {
          input: {
            date,
          },
        },
      }),
  }
}
