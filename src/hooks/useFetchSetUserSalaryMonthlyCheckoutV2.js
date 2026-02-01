import { gql, useMutation } from '@apollo/client'

const FETCH_USER_MONTHLY_CHECKOUT_V2 = gql`
  mutation FETCH_USER_MONTHLY_CHECKOUT_V2(
    $input: [SetUserSalaryMonthlyCheckoutInput]!
    $date: DateTime!
  ) {
    setUserSalaryMonthlyCheckout_V2(input: $input, date: $date)
  }
`

export default function useFetchSetUserSalaryMonthlyCheckoutV2() {
  const [setUserSalaryMonthlyCheckoutV2] = useMutation(FETCH_USER_MONTHLY_CHECKOUT_V2)
  return {
    setUserSalaryMonthlyCheckoutV2: ({ input, date }) =>
      setUserSalaryMonthlyCheckoutV2({
        variables: {
          input,
          date,
        },
      }),
  }
}
