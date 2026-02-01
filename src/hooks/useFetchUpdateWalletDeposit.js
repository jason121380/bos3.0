import { gql, useMutation } from '@apollo/client'

const SET_WALLET_DEPOSIT = gql`
  mutation SET_WALLET_DEPOSIT($id: ID!, $input: WalletDepositInput!) {
    updateWalletDeposit(id: $id, input: $input)
  }
`

export default function useFetchUpdateWalletDeposit() {
  const [updateWalletDeposit] = useMutation(SET_WALLET_DEPOSIT)
  return {
    updateWalletDeposit: ({ id, input }) =>
      updateWalletDeposit({
        variables: {
          id,
          input,
        },
      }),
  }
}
