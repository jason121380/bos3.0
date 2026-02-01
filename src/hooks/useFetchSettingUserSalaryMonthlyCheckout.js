import { gql, useMutation } from '@apollo/client'

const FETCH_USER_MONTHLY_CHECKOUT = gql`
  mutation FETCH_USER_MONTHLY_CHECKOUT(
    $input: [SetUserSalaryMonthlyCheckoutInput]!
    $date: DateTime!
  ) {
    setUserSalaryMonthlyCheckout(input: $input, date: $date)
  }
`

export default function useFetchSetUserSalaryMonthlyCheckout() {
  const [setUserSalaryMonthlyCheckout] = useMutation(FETCH_USER_MONTHLY_CHECKOUT)
  return {
    setUserSalaryMonthlyCheckout: ({ input, date }) =>
      setUserSalaryMonthlyCheckout({
        variables: {
          input,
          date,
        },
      }),
  }
}
