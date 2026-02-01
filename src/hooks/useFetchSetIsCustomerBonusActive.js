import { gql, useMutation } from '@apollo/client'

const SET_CUSTOMER_BONUS = gql`
  mutation SET_CUSTOMER_BONUS($input: Boolean!) {
    setIsCustomerBonusActive(input: $input)
  }
`

export default function useFetchSetIsCustomerBonusActive() {
  const [setIsCustomerBonusActive] = useMutation(
    SET_CUSTOMER_BONUS
  )
  return {
    setIsCustomerBonusActive: ({ input }) =>
      setIsCustomerBonusActive({
        variables: {
          input,
        },
      }),
  }
}