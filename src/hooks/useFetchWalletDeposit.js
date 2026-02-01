import { gql, useMutation } from '@apollo/client'

const FETCH_WALLET_DEPOSIT = gql`
  mutation walletDeposit($input: WalletDepositInput!) {
    walletDeposit(input: $input)
  }
`

export default function useFetchWalletDeposit() {
  const [walletDeposit] = useMutation(FETCH_WALLET_DEPOSIT)
  return {
    walletDeposit: ({ input }) =>
      walletDeposit({
        variables: {
          input,
        },
      }),
  }
}
