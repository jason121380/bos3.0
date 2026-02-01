import { gql, useQuery, useLazyQuery } from '@apollo/client'

const FETCH_GET_VOUCHER_ISSUANCE_RECORD = gql`
  query FETCH_GET_VOUCHER_ISSUANCE_RECORD($input: VoucherIssuanceInput!) {
    voucherIssuanceRecord(input: $input) {
      data {
        number
        eventName
        ruleName
        orderDate
        orderNo
        orderId
        customerName
        customerCellphone
        isCustomerSideUsing
        isSMSSended
      }
      pageLimit
      pageOffset
      totalCount
    }
  }
`

export default function useFetchGetVoucherIssuanceRecord({ input }) {
  return useQuery(FETCH_GET_VOUCHER_ISSUANCE_RECORD, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}

export function useFetchGetVoucherIssuanceRecordLazy() {
  const [getVoucherIssuanceRecord, voucherIssuanceRecordData] = useLazyQuery(FETCH_GET_VOUCHER_ISSUANCE_RECORD, {
    fetchPolicy: 'cache-and-network',
  })
  return [getVoucherIssuanceRecord, voucherIssuanceRecordData]
}