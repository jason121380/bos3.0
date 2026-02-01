import { gql, useQuery } from '@apollo/client'

const FETCH_WALLET_DESPOSIT_DETAIL = gql`
  query walletDepositDetail($id: ID!) {
    walletDepositDetail(id: $id) {
      id
      date
      money
      payType
      Customer {
        id
        name
      }
      Maker {
        id
        name
      }
      remark
      handlingFeeDecountWay
      handlingFeeDecountPrice
    }
  }
`

export default function useFetchWalletDepositDetail({ id }) {
  return useQuery(FETCH_WALLET_DESPOSIT_DETAIL, {
    variables: {
      id,
    },
    fetchPolicy: 'cache-and-network',
  })
}
