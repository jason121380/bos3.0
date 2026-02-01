import { gql, useQuery } from '@apollo/client'

const FETCH_WALLET_USE_RECORD = gql`
  query WALLET_USE_RECORD($input: WalletRecordInput!) {
    walletUseRecord(input: $input) {
      record {
        id
        orderNo
        date
        money
        order {
          id
        }
        Customer {
          id
          name
          cellphone
        }
        Designer {
          id
          name
          designerNo
        }
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchWalletUseRecord({
  start,
  end,
  pageLimit,
  pageOffset,
  customerId,
  designerId,
}) {
  return useQuery(FETCH_WALLET_USE_RECORD, {
    variables: {
      input: {
        start,
        end,
        pageLimit,
        pageOffset,
        customerId,
        designerId,
      },
    },
    fetchPolicy: 'cache-and-network',
  })
}
