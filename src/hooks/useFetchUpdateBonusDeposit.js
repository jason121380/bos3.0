import { gql, useMutation } from '@apollo/client'

const UPDATE_BONUS_DEPOSIT = gql`
  mutation UPDATE_BONUS_DEPOSIT($input: UpdateBonusDepositInput!) {
    updateBonusDeposit(input: $input)
  }
`
export default function useFetchUpdateBonusDeposit() {
  const [updateBonus] = useMutation(UPDATE_BONUS_DEPOSIT)
  return {
    updateBonus: ({ input }) =>
      updateBonus({
        variables: {
          input,
        },
      }),
  }
}