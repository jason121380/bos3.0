import { gql, useQuery, useLazyQuery } from '@apollo/client'

const GET_PURCHASE_RECORDS = gql`
  query GET_PURCHASE_RECORDS($input: PurchaseRecordsInput!) {
    purchaseRecords(input: $input) {
      uuid
      no
      date
      vendorName
      operatorName
      summary
      updatedAt
      remark
      stockInDate
    }
  }
`

export default function useFetchGetPurchaseRecords() {
  const [getPurchaseRecordsLazy, getPurchaseRecordsLazyData] = useLazyQuery(GET_PURCHASE_RECORDS, {
    fetchPolicy: 'cache-and-network',
  })
  return [getPurchaseRecordsLazy, getPurchaseRecordsLazyData]
}

const GET_PURCHASE_RECORD_FOR_EDIT = gql`
  query GET_PURCHASE_RECORD_FOR_EDIT($purchaseUUId: ID!) {
    purchaseRecord(purchaseUUId: $purchaseUUId) {
      uuid
      date
      vendorName
      vendorUUId
      operatorID
      operatorName
      purchaseProduct {
        productID
        productName
        count
        unitPrice
      }
      remark
      stockInDate
    }
  }
`

export function useFetchGetPurchaseRecordForEdit({ purchaseUUId }) {
  return useQuery(GET_PURCHASE_RECORD_FOR_EDIT, {
    variables: {
      purchaseUUId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
