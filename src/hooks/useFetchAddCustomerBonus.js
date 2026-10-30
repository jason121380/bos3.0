import { gql, useMutation } from '@apollo/client'

const ADD_CUSTOMER_BONUS = gql`
mutation ADD_CUSTOMER_BONUS($input: AddCustomerBonusInput!) {
  addCustomerBonus(input: $input)
}
`

export default function useFetchAddCustomerBonus() {
  const [AddCustomerBonus] = useMutation(ADD_CUSTOMER_BONUS)
  return {
    AddCustomerBonus: ({ input }) =>
      AddCustomerBonus({
        variables: {
          input,
        },
      }),
  }
}
