import { gql, useMutation } from '@apollo/client'

const DELETE_WALLET_DEPOSIT = gql`
  mutation DELETE_WALLET_DEPOSIT($id: ID!) {
    deleteWalletDeposit(id: $id)
  }
`
export default function useFetchDeleteWalletDeposit() {
  const [deleteWalletDeposit] = useMutation(DELETE_WALLET_DEPOSIT)
  return { deleteWalletDeposit: ({ id }) => deleteWalletDeposit({ variables: { id } }) }
}
