import { gql, useQuery } from '@apollo/client'

const FETCH_WALLET_DEPOSIT_RECORD = gql`
  query walletdepositrecord($input: WalletRecordInput!) {
    walletDepositRecord(input: $input) {
      record {
        id
        date
        money
        Maker {
          id
          name
          designerNo
        }
        Customer {
          id
          name
          cellphone
          no
        }
        payType
        remark
        handlingFeeDecountWay
        handlingFeeDecountPrice
      }
      totalCount
      pageLimit
      pageOffset
    }
  }
`

export default function useFetchWalletDepositRecord({ start, end, pageLimit, pageOffset, customerId, designerId, payType }) {
  return useQuery(FETCH_WALLET_DEPOSIT_RECORD, {
    variables: {
      input: {
        start,
        end,
        pageLimit,
        pageOffset,
        customerId,
        designerId,
        payType,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
