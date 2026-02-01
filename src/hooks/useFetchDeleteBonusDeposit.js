import { gql, useMutation } from '@apollo/client'

const DELETE_BONUS_DEPOSIT = gql`
  mutation DELETE_BONUS_DEPOSIT($bonusId: [ID]!) {
    deleteBonusDeposit(bonusId: $bonusId)
  }
`
export default function useFetchDeleteBonusDeposit() {
  const [deleteBonus] = useMutation(DELETE_BONUS_DEPOSIT)
  return {
    deleteBonus: ({ bonusId }) =>
      deleteBonus({
        variables: {
          bonusId,
        },
      }),
  }
}